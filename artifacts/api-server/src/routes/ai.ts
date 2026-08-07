import { Router } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
import { generateText } from "../lib/ai-service";

const router = Router();


// ---------------------------------------------------------------------------
// Performance diagnostics (read-only instrumentation — does not change
// behavior or responses). Each stage is timed with a monotonic clock and
// logged with wall-clock timestamps so stage durations can be correlated
// across the frontend and backend logs for a single request.
//
//   validate  -> time spent on input validation/sanitization
//   prompt    -> time spent building the prompt string
//   gemini    -> time spent waiting on the Gemini API call (network + model)
//   serialize -> time spent building/sending the JSON response
//   total     -> validate + prompt + gemini + serialize (server-side total)
// ---------------------------------------------------------------------------
function nowMs(): number {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

// ---------------------------------------------------------------------------
// Lightweight performance helpers.
// ---------------------------------------------------------------------------
const DEFAULT_MAX_OUTPUT_TOKENS = 1000;
const TOOL_MAX_OUTPUT_TOKENS: Record<string, number> = {
  "ai-grammar-checker": 300,
  "ai-email-writer": 700,
  "ai-resume-builder": 1200,
  "ai-cover-letter": 1000,
  "ai-essay-generator": 2500,
  "ai-writer": 1500,
  "ai-summarizer": 900,
  "ai-paraphraser": 900,
  "ai-humanizer": 900,
  "ai-seo-title": 400,
  "ai-meta-description": 400,
  "ai-blog-title": 400,
  "ai-twitter-post": 500,
  "ai-linkedin-post": 500,
  "ai-instagram-caption": 500,
  "ai-youtube-title": 400,
  "ai-ad-copy-generator": 700,
  "ai-sales-copy-generator": 700,
  "ai-landing-page-copy-generator": 700,
  "ai-cta-generator": 400,
  "ai-resume-summary": 700,
  "ai-linkedin-headline": 400,
  "ai-professional-bio": 500,
  "ai-blog-introduction": 700,
  "ai-blog-conclusion": 700,
  "ai-article-rewriter": 900,
  "ai-paragraph-rewriter": 700,
  "ai-sentence-rewriter": 600,
  "ai-cold-email": 600,
  "ai-sales-email": 600,
  "ai-followup-email": 600,
  "ai-support-reply": 600,
  "ai-thank-you-email": 600,
  "ai-text-improver": 900,
  "ai-tone-changer": 800,
  "ai-expand-text": 900,
  "ai-shorten-text": 700,
  "ai-proofreader": 700,
  "ai-story-writer": 1400,
  "ai-book-outline-generator": 1200,
  "ai-chapter-generator": 1800,
  "ai-speech-writer": 1000,
  "ai-interview-questions": 1200,
  "ai-meeting-notes": 1000,
  "ai-interview-practice": 1100,
  "ai-interview-start": 700,
  "ai-interview-respond": 500,
  "ai-hashtag-generator": 500,
  "ai-youtube-description": 700,
  "ai-blog-outline": 900,
  "ai-mission-statement": 600,
  "ai-vision-statement": 600,
  "ai-company-bio": 800,
  "ai-brand-story": 800,
  "ai-sql-generator": 900,
  "ai-regex-generator": 800,
  "ai-code-explainer": 800,
  "ai-code-reviewer": 900,
  "ai-bug-finder": 900,
  "ai-json-formatter": 800,
  "ai-event-assistant": 1200,
  "ai-event-itinerary": 900,
  "ai-event-checklist": 900,
  "ai-event-invitation": 800,
  "ai-practice-questions": 1000,
  "ai-mock-exam-generator": 1400,
  "ai-tutor-chat": 900,
  "ai-flashcard-generator": 900,
  "ai-study-notes-generator": 1200,
  "ai-weak-topic-analyzer": 900,
  "ai-study-planner": 900,
  "ai-previous-question-generator": 1000,
  "ai-performance-analytics": 900,
  "ai-pdf-practice-papers": 1400,
  "ai-daily-practice": 900,
};

const COMPLEX_TOOL_IDS = new Set([
  "ai-resume-builder",
  "ai-cover-letter",
  "ai-essay-generator",
  "ai-story-writer",
  "ai-book-outline-generator",
  "ai-chapter-generator",
  "ai-speech-writer",
  "ai-interview-questions",
  "ai-interview-practice",
  "ai-resume-summary",
  "ai-resume-bullet-points",
]);

function getOutputTokenBudget(toolId: string): number {
  return TOOL_MAX_OUTPUT_TOKENS[toolId] ?? DEFAULT_MAX_OUTPUT_TOKENS;
}


function compactPrompt(prompt: string): string {
  return prompt.replace(/\n{3,}/g, "\n\n").trim();
}


// ---------------------------------------------------------------------------
// Rate limiting — 20 requests per minute per IP
// ---------------------------------------------------------------------------
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment before trying again." },
});

// ---------------------------------------------------------------------------
// Per-tool schema: required keys + max character lengths for each input field
// ---------------------------------------------------------------------------
const TOOL_SCHEMAS: Record<string, { required: string[]; maxLengths: Record<string, number> }> = {
  "ai-writer":             { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-summarizer":         { required: ["text"],       maxLengths: { text: 20000 } },
  "ai-paraphraser":        { required: ["text"],       maxLengths: { text: 10000 } },
  "ai-grammar-checker":    { required: ["text"],       maxLengths: { text: 10000 } },
  "ai-humanizer":          { required: ["text"],       maxLengths: { text: 10000 } },
  "ai-email-writer":       { required: ["purpose"],    maxLengths: { recipient: 200, purpose: 2000 } },
  "ai-resume-builder":     { required: ["name", "target_role", "experience", "skills"], maxLengths: { name: 100, target_role: 100, current_role: 200, experience: 5000, skills: 500, education: 500 } },
  "ai-cover-letter":       { required: ["name", "target_role", "company", "experience"], maxLengths: { name: 100, target_role: 100, company: 100, experience: 3000, skills: 500 } },
  "ai-business-name":      { required: ["industry"],   maxLengths: { industry: 200, keywords: 300 } },
  "ai-slogan-generator":   { required: ["business_name", "industry"], maxLengths: { business_name: 100, industry: 200 } },
  "ai-product-description":{ required: ["product", "features"], maxLengths: { product: 200, features: 2000, audience: 300 } },
  "ai-seo-title":          { required: ["topic"],      maxLengths: { topic: 300, keywords: 300 } },
  "ai-meta-description":   { required: ["topic"],      maxLengths: { topic: 300, keywords: 300 } },
  "ai-keyword-generator":  { required: ["topic"],      maxLengths: { topic: 300, niche: 200 } },
  "ai-sql-generator":      { required: ["description"], maxLengths: { description: 2000, schema: 5000 } },
  "ai-regex-generator":    { required: ["description"], maxLengths: { description: 1000 } },
  "ai-code-explainer":     { required: ["code"],       maxLengths: { code: 15000 } },
  "ai-code-reviewer":      { required: ["code"],       maxLengths: { code: 15000 } },
  "ai-bug-finder":         { required: ["code"],       maxLengths: { code: 15000 } },
  "ai-json-formatter":     { required: ["json"],       maxLengths: { json: 20000 } },
  "ai-essay-generator":    { required: ["topic"],      maxLengths: { topic: 300, style: 50 } },
  "ai-story-writer":       { required: ["prompt"],      maxLengths: { prompt: 1000, tone: 50 } },
  "ai-book-outline-generator": { required: ["topic"], maxLengths: { topic: 300 } },
  "ai-chapter-generator":  { required: ["topic"],      maxLengths: { topic: 300, chapter: 200 } },
  "ai-speech-writer":      { required: ["topic"],      maxLengths: { topic: 300, audience: 200 } },
  "ai-interview-questions":{ required: ["role"],       maxLengths: { role: 200 } },
  "ai-meeting-notes":      { required: ["transcript"], maxLengths: { transcript: 20000 } },
  "ai-interview-practice": { required: ["role", "question", "answer"], maxLengths: { role: 200, question: 2000, answer: 5000 } },
  "ai-interview-start":    { required: ["role"], maxLengths: { role: 200 } },
  "ai-interview-respond":  { required: ["role", "question", "answer"], maxLengths: { role: 200, question: 2000, answer: 5000 } },
  "ai-hashtag-generator":  { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-youtube-title":      { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-instagram-caption":  { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-ad-copy-generator": { required: ["product"], maxLengths: { product: 300, audience: 300, offer: 1000 } },
  "ai-facebook-ad-copy-generator": { required: ["product", "offer"], maxLengths: { product: 300, audience: 300, offer: 1500 } },
  "ai-google-ads-copy-generator": { required: ["product"], maxLengths: { product: 300, keyword: 200 } },
  "ai-linkedin-ad-copy-generator": { required: ["product", "benefit"], maxLengths: { product: 300, audience: 300, benefit: 1500 } },
  "ai-sales-copy-generator": { required: ["product", "pain_point"], maxLengths: { product: 300, audience: 300, pain_point: 1500 } },
  "ai-landing-page-copy-generator": { required: ["product", "benefit"], maxLengths: { product: 300, audience: 300, benefit: 1500 } },
  "ai-cta-generator": { required: ["offer"], maxLengths: { offer: 300, audience: 300 } },
  "ai-mission-statement": { required: ["what"], maxLengths: { business_name: 100, what: 300, who: 200, values: 300 } },
  "ai-vision-statement": { required: ["future"], maxLengths: { business_name: 100, mission: 300, future: 300, impact: 300 } },
  "ai-company-bio": { required: ["company_name", "mission"], maxLengths: { company_name: 100, founded: 300, mission: 1000, achievements: 500 } },
  "ai-brand-story": { required: ["company_name", "founder_story"], maxLengths: { company_name: 100, founder_story: 1000, problem: 300, solution: 300 } },
  "ai-resume-summary": { required: ["target_role","experience"], maxLengths: {"target_role":100,"experience":2000,"skills":500} },
  "ai-resume-bullet-points": { required: ["role","responsibilities"], maxLengths: {"role":150,"responsibilities":3000} },
  "ai-linkedin-headline": { required: ["role"], maxLengths: {"role":150,"skills":300,"industry":150} },
  "ai-professional-bio": { required: ["name","role","background"], maxLengths: {"name":100,"role":150,"background":2000} },
  "ai-twitter-post": { required: ["topic"], maxLengths: {"topic":300} },
  "ai-linkedin-post": { required: ["topic"], maxLengths: {"topic":300} },
  "ai-tiktok-caption": { required: ["topic"], maxLengths: {"topic":300} },
  "ai-youtube-description": { required: ["title","topic"], maxLengths: {"title":200,"topic":2000,"keywords":300} },
  "ai-blog-title": { required: ["topic"], maxLengths: {"topic":300,"keywords":300} },
  "ai-blog-outline": { required: ["topic"], maxLengths: {"topic":300,"audience":300} },
  "ai-blog-introduction": { required: ["topic"], maxLengths: {"topic":300} },
  "ai-blog-conclusion": { required: ["topic"], maxLengths: {"topic":300,"cta":300} },
  "ai-article-rewriter": { required: ["text"], maxLengths: {"text":15000} },
  "ai-paragraph-rewriter": { required: ["text"], maxLengths: {"text":4000} },
  "ai-sentence-rewriter": { required: ["text"], maxLengths: {"text":1000} },
  "ai-cold-email": { required: ["offer"], maxLengths: {"recipient":200,"offer":2000} },
  "ai-sales-email": { required: ["product"], maxLengths: {"product":300,"audience":300} },
  "ai-followup-email": { required: ["context"], maxLengths: {"context":2000} },
  "ai-support-reply": { required: ["issue"], maxLengths: {"issue":3000} },
  "ai-thank-you-email": { required: ["occasion"], maxLengths: {"occasion":300,"recipient":200,"details":1000} },
  "ai-text-improver": { required: ["text"], maxLengths: {"text":10000} },
  "ai-tone-changer": { required: ["text"], maxLengths: {"text":8000} },
  "ai-expand-text": { required: ["text"], maxLengths: {"text":5000} },
  "ai-shorten-text": { required: ["text"], maxLengths: {"text":10000} },
  "ai-proofreader":    { required: ["text"],  maxLengths: {"text":10000} },
  "ai-ghostwriting":   { required: ["topic"], maxLengths: {"topic":3000} },
  "ai-event-assistant": { required: ["event_type", "theme"], maxLengths: { event_type: 100, theme: 200, guest_count: 100, budget: 100, details: 2000 } },
  "ai-event-itinerary": { required: ["event_name", "flow"], maxLengths: { event_name: 200, duration: 100, flow: 4000 } },
  "ai-event-checklist": { required: ["event_name", "timeline"], maxLengths: { event_name: 200, details: 3000 } },
  "ai-event-invitation": { required: ["event_name", "tone"], maxLengths: { event_name: 200, audience: 200, details: 2000 } },
  "ai-practice-questions": { required: ["topic"], maxLengths: { topic: 300, exam: 200, difficulty: 50, count: 20 } },
  "ai-mock-exam-generator": { required: ["topic"], maxLengths: { topic: 300, duration: 100, difficulty: 50, count: 20 } },
  "ai-tutor-chat": { required: ["topic", "question"], maxLengths: { topic: 300, question: 3000, level: 50 } },
  "ai-flashcard-generator": { required: ["topic"], maxLengths: { topic: 300, level: 50, count: 20 } },
  "ai-study-notes-generator": { required: ["topic"], maxLengths: { topic: 300, level: 50, format: 100 } },
  "ai-weak-topic-analyzer": { required: ["topic", "details"], maxLengths: { topic: 300, details: 4000 } },
  "ai-study-planner": { required: ["topic"], maxLengths: { topic: 300, date: 100, hours: 100 } },
  "ai-previous-question-generator": { required: ["topic"], maxLengths: { topic: 300, exam: 200, count: 20 } },
  "ai-performance-analytics": { required: ["topic", "details"], maxLengths: { topic: 300, details: 4000 } },
  "ai-pdf-practice-papers": { required: ["topic"], maxLengths: { topic: 300, level: 100, count: 20 } },
  "ai-daily-practice": { required: ["topic"], maxLengths: { topic: 300, goal: 200, difficulty: 50 } },
};

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------
function buildPrompt(toolId: string, inputs: Record<string, string>): string | null {
  const i = inputs;
  switch (toolId) {
    case "ai-writer":
      return `Write a high-quality, engaging ${i.length || "medium-length"} article about "${i.topic}" in a ${i.tone || "professional"} tone. Include a compelling introduction, well-structured body sections with clear headings, and a strong conclusion. Make it informative and valuable to the reader.`;

    case "ai-summarizer":
      return `Summarize the following text in a ${i.style || "Paragraph"} format with ${i.length || "Moderate"} detail. Be concise and capture the key ideas accurately.\n\nText to summarize:\n${i.text}`;

    case "ai-paraphraser":
      return `Paraphrase the following text in a ${i.style || "Standard"} style. Preserve the original meaning while using different words and sentence structures. Make it sound natural and fluent.\n\nOriginal text:\n${i.text}`;

    case "ai-grammar-checker":
      return `Check the following text for grammar, spelling, punctuation, and style errors. Return the corrected version followed by a list of all changes made and explanations for each correction.\n\nText:\n${i.text}`;

    case "ai-humanizer":
      return `Rewrite the following AI-generated text to sound more natural, human, and engaging in a ${i.style || "Natural"} style. Remove robotic phrasing, vary sentence length, add natural transitions, and make it feel authentically written by a person.\n\nText to humanize:\n${i.text}`;

    case "ai-email-writer":
      return `Write a ${i.tone || "Professional"} ${i.type || "Professional"} email to ${i.recipient || "the recipient"} about: ${i.purpose}. Include a clear subject line (prefixed with "Subject:"), greeting, well-structured body, and appropriate sign-off. Make it concise and effective.`;

    case "ai-resume-builder":
      return `Create a professional, ATS-optimized resume for ${i.name} targeting the role of ${i.target_role || i.current_role}.\n\nDetails:\n- Current/Recent Role: ${i.current_role}\n- Experience: ${i.experience}\n- Key Skills: ${i.skills}\n- Education: ${i.education}\n\nFormat with clear sections: Summary, Experience, Skills, Education. Use strong action verbs and quantify achievements where possible.`;

    case "ai-cover-letter":
      return `Write a compelling, personalized cover letter for ${i.name} applying to the position of ${i.target_role} at ${i.company}.\n\nCandidate background:\n- Skills: ${i.skills}\n- Experience: ${i.experience}\n\nMake it enthusiastic, specific to the company, and highlight why they are an ideal fit. Keep it to 3-4 paragraphs.`;

    case "ai-business-name":
      return `Generate 10 creative, memorable, and unique business names for a ${i.industry} business. Style preference: ${i.style || "Modern"}. Keywords to consider: ${i.keywords || "none specified"}.\n\nFor each name, provide:\n1. The name\n2. Why it works (1 sentence)\n3. Domain availability tip\n\nMake the names distinctive, easy to remember, and appropriate for the industry.`;

    case "ai-slogan-generator":
      return `Generate 10 catchy, memorable slogans/taglines for "${i.business_name}" in the ${i.industry} industry. Tone: ${i.tone || "Professional"}.\n\nFor each slogan:\n1. The slogan\n2. Brief explanation of why it works\n\nMake them punchy, relevant, and easy to remember.`;

    case "ai-product-description":
      return `Write a compelling ${i.tone || "Persuasive"} product description for: ${i.product}\n\nKey features: ${i.features}\nTarget audience: ${i.audience || "general consumers"}\n\nInclude:\n- Attention-grabbing opening line\n- Key benefits (not just features)\n- Who it's perfect for\n- Call to action\n\nMake it conversion-focused and persuasive.`;

    case "ai-seo-title":
      return `Generate 10 SEO-optimized page titles for the topic: "${i.topic}"\nTarget keywords: ${i.keywords || "derived from topic"}\n\nRules:\n- Each title should be 50-60 characters\n- Include the primary keyword naturally\n- Be click-worthy and accurate\n- Avoid clickbait\n\nList each title on a new line with its character count.`;

    case "ai-meta-description":
      return `Generate 5 SEO-optimized meta descriptions for the topic: "${i.topic}"\nTarget keywords: ${i.keywords || "derived from topic"}\n\nRules:\n- Each description should be 150-160 characters\n- Include target keywords naturally\n- Include a subtle call to action\n- Accurately describe the page content\n\nList each with its character count.`;

    case "ai-keyword-generator":
      return `Generate a comprehensive list of SEO keywords for the topic "${i.topic}" in the ${i.niche || "general"} niche.\n\nOrganize into categories:\n1. Primary Keywords (high volume, core topic)\n2. Long-tail Keywords (specific, lower competition)\n3. LSI/Semantic Keywords (related terms)\n4. Question Keywords (what, how, why searches)\n5. Commercial Intent Keywords (buy, best, compare)\n\nFor each keyword, indicate estimated search intent (Informational/Commercial/Transactional).`;

    case "ai-sql-generator":
      return `Generate a SQL query based on this description: "${i.description}"\n${i.schema ? `\nDatabase schema:\n${i.schema}` : ""}\n\nProvide:\n1. The SQL query (well-formatted)\n2. Step-by-step explanation of how it works\n3. Any important notes or alternative approaches\n\nUse standard SQL syntax compatible with PostgreSQL/MySQL.`;

    case "ai-regex-generator":
      return `Generate a regular expression that matches: "${i.description}"\n\nProvide:\n1. The regex pattern\n2. Explanation of each part\n3. Example matches (3-5 examples that match)\n4. Example non-matches (2-3 that should NOT match)\n5. Usage example in JavaScript/Python\n\nMake it as precise and efficient as possible.`;

    case "ai-code-explainer":
      return `Explain the following ${i.language || "code"} code in clear, plain English:\n\n\`\`\`${i.language || ""}\n${i.code}\n\`\`\`\n\nProvide:\n1. High-level overview (what it does)\n2. Step-by-step breakdown of each section\n3. Key concepts used\n4. Potential use cases\n\nExplain as if teaching a developer who is new to this pattern.`;

    case "ai-code-reviewer":
      return `Perform a thorough code review of the following ${i.language || "code"}:\n\n\`\`\`${i.language || ""}\n${i.code}\n\`\`\`\n\nEvaluate and provide feedback on:\n1. **Code Quality** — readability, maintainability, structure\n2. **Performance** — inefficiencies, optimization opportunities\n3. **Security** — potential vulnerabilities\n4. **Best Practices** — conventions, patterns, anti-patterns\n5. **Suggestions** — concrete improvements with code examples\n\nRate overall quality: Excellent / Good / Needs Improvement / Poor`;

    case "ai-bug-finder":
      return `Analyze the following ${i.language || "code"} for bugs, errors, and issues:\n\n\`\`\`${i.language || ""}\n${i.code}\n\`\`\`\n\nFor each issue found:\n1. **Bug description** — what the problem is\n2. **Severity** — Critical / High / Medium / Low\n3. **Line(s) affected** — approximate location\n4. **Root cause** — why it's a bug\n5. **Fix** — corrected code snippet\n\nAlso note any potential edge cases or improvements.`;

    case "ai-json-formatter":
      return `Analyze and explain the following JSON:\n\n${i.json}\n\nProvide:\n1. **Formatted JSON** — properly indented and validated\n2. **Structure Overview** — what this JSON represents\n3. **Key Fields Explained** — description of each top-level key\n4. **Data Types** — list field names and their types\n5. **Any Issues** — invalid syntax, inconsistencies, or improvements\n\nIf the JSON is invalid, explain what's wrong and how to fix it.`;

    case "ai-study-notes":
      return `Create comprehensive ${i.format || "Detailed Notes"} study notes for the topic: "${i.topic}"\nLevel: ${i.level || "Intermediate"}\n\nInclude:\n1. **Key Concepts** — core ideas explained clearly\n2. **Important Terms** — definitions in simple language\n3. **Main Points** — organized hierarchically\n4. **Examples** — illustrative examples for each concept\n5. **Summary** — quick review bullet points\n6. **Memory Tips** — mnemonics or tricks where applicable\n\nMake notes scannable and revision-friendly.`;

    case "ai-quiz-generator":
      return `Generate ${i.count || "10"} ${i.difficulty || "Mixed"} difficulty quiz questions about: "${i.topic}"\n\nFor each question:\n1. Question number and text\n2. Four multiple choice options (A, B, C, D)\n3. Correct answer (marked with ✓)\n4. Brief explanation of why it's correct\n\nVary question types: factual recall, application, analysis. Make distractors plausible.`;

    case "ai-flashcard-generator":
      return `Create ${i.count || "15"} flashcards for studying: "${i.topic}"\n\nFormat each flashcard as:\n**Card [N]**\n🔷 FRONT: [Question or term]\n🔶 BACK: [Answer or definition]\n\nMake questions clear and specific. Answers should be concise (1-3 sentences). Cover the most important concepts progressively.`;

    case "ai-interview-questions":
      return `Generate ${i.count || "15"} ${i.type || "Mixed"} interview questions for a ${i.level || "Mid"}-level ${i.role} position.\n\nFor EACH question provide:\n\n**Q[N]: [The interview question]**\n\n**Sample Answer:**\n[A complete, realistic example answer a strong candidate would actually give. Write it in first person as if the candidate is speaking. For behavioral questions use the STAR format (Situation, Task, Action, Result) with specific made-up but realistic details. For technical questions give a clear, accurate explanation with examples. Answers should be 100–200 words each — detailed enough to be genuinely useful, not just bullet points or a framework.]\n\n---\n\nMake the questions realistic and specific to the role and seniority level. Do not include scoring rubrics, coaching tips, or meta-commentary — just the question and a strong sample answer the candidate can learn from.`;

    case "ai-meeting-notes":
      return `Convert the following meeting content into professional, structured meeting notes:\n\n${i.transcript}\n\nFormat as:\n## Meeting Notes\n\n**Date:** [if mentioned]\n**Attendees:** [if mentioned]\n\n### Key Discussion Points\n[Organized bullet points]\n\n### Decisions Made\n[Clear list of decisions]\n\n### Action Items\n| Owner | Task | Deadline |\n[Table of action items]\n\n### Next Steps\n[Summary of follow-ups]\n\nMake the notes clear, professional, and scannable.`;

    case "ai-interview-practice":
      return `You are an expert interview coach. The candidate is practicing for a "${i.role}" position.\n\nInterview question: "${i.question}"\n\nCandidate's answer:\n"${i.answer}"\n\nEvaluate the answer and respond with:\n## Overall Score\n[X/10] with a one-line summary\n\n### Strengths\n[What the candidate did well — structure, specifics, relevance]\n\n### Areas to Improve\n[Concrete gaps — missing structure like STAR, vague claims, no metrics, etc.]\n\n### Improved Sample Answer\n[Rewrite the answer as a strong, concise model response for this role]\n\n### Follow-up Questions to Expect\n[2-3 likely follow-up questions an interviewer might ask next]\n\nBe direct, specific, and encouraging.`;

    case "ai-interview-start":
      return `You are about to conduct a ${i.type || "Mixed"} job interview for a ${i.level || "Mid"}-level ${i.role} position.\n\nGenerate exactly ${i.count || "8"} interview questions. Output ONLY a plain numbered list — no intro text, no commentary, no labels, nothing else.\n\nFormat strictly as:\n1. [question]\n2. [question]\n...\n\nMake the questions realistic, varied, and appropriate for the role and seniority. For Mixed type include both behavioral and technical questions. For Behavioral use STAR-eliciting questions. For Technical use specific role-relevant questions.`;

    case "ai-interview-respond":
      return `You are a professional interviewer conducting a live ${i.role} interview.\n\nYou just asked: "${i.question}"\n\nThe candidate answered:\n"${i.answer}"\n\nRespond as an interviewer would in a real interview debrief — 2 to 3 sentences only. Acknowledge what they got right (be specific), flag one thing that was weak or missing (be direct), and close with an encouraging line. Keep it natural and conversational, not a formal rubric.\n\nThen on a new line output exactly:\nScore: X/10\n\nNothing else after the score.`;

    case "ai-hashtag-generator":
      return `Generate ${i.count || "30"} highly relevant hashtags for the topic: "${i.topic}" optimized for ${i.platform || "Instagram"}.\n\nOrganize into:\n**High Reach (1M+ posts):** [5-8 hashtags]\n**Medium Reach (100K-1M posts):** [10-12 hashtags]\n**Niche/Low Competition (under 100K):** [8-10 hashtags]\n**Branded/Unique:** [3-5 hashtags]\n\nInclude strategy tips for best results on ${i.platform || "Instagram"}.`;

    case "ai-youtube-title":
      return `Generate 10 high-performing YouTube video titles about: "${i.topic}"\nStyle: ${i.style || "Clickbait"}\n\nFor each title:\n1. The title (60 characters max)\n2. Why it works (curiosity gap, keyword, emotion used)\n\nMake titles compelling, accurate, and optimized for YouTube search. Vary the formats (question, number, how-to, story, etc.).`;

    case "ai-instagram-caption":
      return `Write 5 engaging Instagram captions for a post about: "${i.topic}"\nTone: ${i.tone || "Casual"}\n\nFor each caption:\n1. The caption (with emojis where appropriate)\n2. 5-10 relevant hashtags\n3. A call to action\n\nVary length (short/punchy, medium/storytelling, long/conversational). Make them authentic and platform-native.`;

    case "ai-ad-copy-generator":
      return `Create 5 high-impact ad copy options for: "${i.product}"\nTarget audience: ${i.audience || "general consumers"}\nOffer/CTA: ${i.offer || "undefined"}\n\nFor each version:\n1. Headline (max 30 characters)\n2. Description (2-3 sentences)\n3. Why it works for the audience\n\nMake them compelling, benefit-focused, and ready for advertising platforms (Google Ads, Facebook, LinkedIn, etc.).`;

    case "ai-facebook-ad-copy-generator":
      return `Write 5 compelling Facebook ad copy variations for: "${i.product}"\nTarget audience: ${i.audience || "Facebook users"}\nOffer: ${i.offer || "undefined"}\n\nFor each:\n1. Short headline\n2. Body copy (2-3 sentences)\n3. Suggested CTA button text\n\nOptimize for Facebook's visual-first format. Include emotional appeal and clear value proposition.`;

    case "ai-google-ads-copy-generator":
      return `Generate 3 high-converting Google Ads for: "${i.product}"\nKeyword: ${i.keyword || "primary keyword"}\n\nFor each ad include:\n1. Headline 1 (30 chars max)\n2. Headline 2 (30 chars max)\n3. Headline 3 (30 chars max)\n4. Description (90 chars max)\n\nInclude target keyword naturally. Focus on benefits and urgency.`;

    case "ai-linkedin-ad-copy-generator":
      return `Write 3 professional LinkedIn ad variations for: "${i.product}"\nTarget audience: ${i.audience || "B2B professionals"}\nKey benefit: ${i.benefit || "undefined"}\n\nFor each:\n1. Headline (50 chars max)\n2. Body text (150 chars max)\n3. CTA suggestion\n\nMake copy professional, value-driven, and B2B-focused.`;

    case "ai-sales-copy-generator":
      return `Write compelling sales copy for: "${i.product}"\nTarget audience: ${i.audience || "prospects"}\nMain pain point: ${i.pain_point || "undefined"}\nTone: ${i.tone || "Persuasive"}\n\nInclude:\n1. Attention-grabbing headline\n2. Problem statement\n3. Solution explanation\n4. Social proof / credibility\n5. Call to action\n\nMake it persuasive and conversion-focused.`;

    case "ai-landing-page-copy-generator":
      return `Generate landing page copy for: "${i.product}"\nTarget audience: ${i.audience || "prospects"}\nPrimary benefit: ${i.benefit || "undefined"}\nTone: ${i.tone || "Confident"}\n\nProvide:\n1. Hero headline\n2. Subheadline\n3. Value proposition bullets (3-5)\n4. Body section\n5. CTA button text\n\nFocus on conversion and clarity.`;

    case "ai-cta-generator":
      return `Generate 10 compelling call-to-action texts for: "${i.offer}"\nTarget audience: ${i.audience || "general audience"}\nTone: ${i.tone || "Professional"}\n\nFor each CTA:\n1. The CTA text (3-5 words)\n2. Variation for urgency/benefit\n3. Where it works best\n\nInclude mix of action verbs and emotional triggers.`;

    case "ai-mission-statement":
      return `Create a compelling mission statement for: "${i.business_name}"\n\nBusiness overview:\n- What: ${i.what}\n- Target: ${i.who || "undefined"}\n- Values: ${i.values || "undefined"}\nTone: ${i.tone || "Inspiring"}\n\nProvide:\n1. A concise mission statement (1-2 sentences)\n2. Explanation of why it resonates\n3. How it differentiates the company`;

    case "ai-vision-statement":
      return `Create an inspiring vision statement for: "${i.business_name}"\n\nContext:\n- Mission: ${i.mission || "undefined"}\n- Future goal: ${i.future}\n- Desired impact: ${i.impact || "undefined"}\nTone: ${i.tone || "Visionary"}\n\nProvide:\n1. A clear, aspirational vision statement\n2. Why it's compelling\n3. How to communicate it to stakeholders`;

    case "ai-company-bio":
      return `Write a professional company bio for: "${i.company_name}"\n\nDetails:\n- Founded: ${i.founded || "timing not specified"}\n- Mission: ${i.mission}\n- Achievements: ${i.achievements || "none specified"}\nStyle: ${i.style || "Formal"}\n\nProvide:\n1. Short bio (50-75 words for LinkedIn, website)\n2. Medium bio (150-200 words for "About" page)\n3. Long bio (300+ words for detailed company profile)`;

    case "ai-brand-story":
      return `Craft a compelling brand story for: "${i.company_name}"\n\nFounder/Origin:\n${i.founder_story}\n\nAdditional context:\n- Problem solved: ${i.problem || "undefined"}\n- Solution: ${i.solution || "undefined"}\nTone: ${i.tone || "Personal"}\n\nProvide:\n1. The brand story narrative\n2. Emotional hooks and turning points\n3. How to adapt it for different platforms`;

    case "ai-resume-summary":
      return `Write a compelling, ATS-friendly professional resume summary (3-4 sentences) for a candidate targeting the role of ${i.target_role}.\n\nBackground: ${i.experience}\nKey skills: ${i.skills || "not specified"}\n\nMake it punchy, results-oriented, and tailored to the target role. Provide 2 alternate versions.`;

    case "ai-resume-bullet-points":
      return `Convert the following job responsibilities for a ${i.role} into ${i.count || "5"} powerful, achievement-focused resume bullet points.\n\nResponsibilities:\n${i.responsibilities}\n\nRules:\n- Start each bullet with a strong action verb\n- Quantify impact with numbers/metrics where plausible\n- Keep each bullet to one line\n- Focus on outcomes, not just duties`;

    case "ai-linkedin-headline":
      return `Generate 8 attention-grabbing LinkedIn headlines (under 220 characters each) for someone who is a "${i.role}"${i.industry ? ` in the ${i.industry} industry` : ""}.\nKey skills/specialties: ${i.skills || "not specified"}\n\nMake them keyword-rich for LinkedIn search, specific, and value-focused rather than just a job title.`;

    case "ai-professional-bio":
      return `Write a ${i.tone || "Professional"} personal bio for ${i.name}, a ${i.role}.\n\nBackground: ${i.background}\n\nProvide 3 versions: a short one-liner (for Twitter/X bio), a medium version (100-150 words for LinkedIn/website "About"), and a longer version (250+ words for a speaker page or press kit). Write in third person.`;

    case "ai-twitter-post":
      return `Write 5 engaging X (Twitter) posts about: "${i.topic}"\nTone: ${i.tone || "Witty"}\n\nEach post must be under 280 characters. Vary the hook style (question, bold claim, stat, story, list). Include relevant hashtags only where they add value.`;

    case "ai-linkedin-post":
      return `Write a LinkedIn post about: "${i.topic}"\nGoal: ${i.goal || "Thought Leadership"}\nTone: ${i.tone || "Professional"}\n\nStructure it with a strong hook line, short paragraphs (1-2 sentences each) for scannability, a personal or concrete example, and a closing line that invites engagement (question or CTA). Keep it under 200 words.`;

    case "ai-tiktok-caption":
      return `Write 5 scroll-stopping TikTok captions for a video about: "${i.topic}"\nTone: ${i.tone || "Fun"}\n\nFor each caption:\n1. Short hook-driven caption (under 150 characters)\n2. 5-8 relevant trending hashtags\n\nMake them native to TikTok's casual, high-energy style.`;

    case "ai-youtube-description":
      return `Write an SEO-optimized YouTube video description for the video titled "${i.title}".\n\nVideo summary: ${i.topic}\nTarget keywords: ${i.keywords || "derived from topic"}\n\nInclude:\n1. A compelling first 2 lines (shown before "Show more")\n2. A fuller description with natural keyword usage\n3. A placeholder timestamp outline (e.g. 00:00 Intro)\n4. A call to action to subscribe\n5. 10-15 relevant hashtags at the end`;

    case "ai-blog-title":
      return `Generate 10 catchy, click-worthy blog post titles about: "${i.topic}"\nTarget keywords: ${i.keywords || "derived from topic"}\n\nVary the formats (how-to, listicle, question, ultimate guide, comparison). Keep each title under 70 characters and naturally include the target keyword where possible.`;

    case "ai-blog-outline":
      return `Create a detailed blog post outline for the topic: "${i.topic}"\nTarget audience: ${i.audience || "general readers"}\n\nProvide:\n1. A working title\n2. Introduction hook idea\n3. 5-8 H2 section headings with 2-3 bullet points of key content under each\n4. A conclusion idea with a call to action\n\nMake it logically structured and comprehensive enough to write a full article from.`;

    case "ai-blog-introduction":
      return `Write 3 alternative blog post introductions (2-3 short paragraphs each) for a post about: "${i.topic}"\nHook style: ${i.hook || "Question"}\n\nEach introduction should grab attention immediately, establish why the reader should care, and transition naturally into the body of the article.`;

    case "ai-blog-conclusion":
      return `Write a strong closing conclusion (1-2 short paragraphs) for a blog post about: "${i.topic}"\n\nSummarize the key takeaway, reinforce the value to the reader, and end with a clear call to action${i.cta ? ` encouraging them to: ${i.cta}` : ""}.`;

    case "ai-article-rewriter":
      return `Rewrite the following article to be more original, engaging, and well-structured while preserving all facts, claims, and meaning. Improve flow, vary sentence structure, and tighten weak phrasing.\n\nOriginal article:\n${i.text}`;

    case "ai-paragraph-rewriter":
      return `Rewrite the following paragraph in a ${i.style || "Standard"} style, keeping the same meaning but improving flow and word choice.\n\nOriginal paragraph:\n${i.text}`;

    case "ai-sentence-rewriter":
      return `Rewrite the following sentence(s) in a ${i.style || "Standard"} style. Provide 3 alternative phrasings for each, keeping the original meaning.\n\nOriginal:\n${i.text}`;

    case "ai-cold-email":
      return `Write a short, effective cold outreach email to ${i.recipient || "a potential customer"} in a ${i.tone || "Direct"} tone.\n\nWhat's being offered:\n${i.offer}\n\nInclude a subject line (prefixed with "Subject:"), a personalized-feeling opener, a clear value proposition, and a low-friction call to action. Keep it under 120 words.`;

    case "ai-sales-email":
      return `Write a persuasive sales email for: ${i.product}\nTarget audience: ${i.audience || "prospects"}\nTone: ${i.tone || "Persuasive"}\n\nInclude a subject line (prefixed with "Subject:"), a benefit-driven opening, 2-3 key selling points, and a clear call to action. Keep it concise and conversion-focused.`;

    case "ai-followup-email":
      return `Write a polite, effective follow-up email in a ${i.tone || "Polite"} tone for this situation:\n\n${i.context}\n\nInclude a subject line (prefixed with "Subject:"), a brief reminder of the prior contact, and a clear, low-pressure next step or question.`;

    case "ai-support-reply":
      return `Write a ${i.tone || "Empathetic"} customer support reply to this issue:\n\n${i.issue}\n\nAcknowledge the customer's frustration or question, provide a clear next step or resolution, and close with a helpful, professional tone. Keep it concise.`;

    case "ai-thank-you-email":
      return `Write a warm, genuine thank-you email to ${i.recipient || "the recipient"} for the occasion: ${i.occasion}.\n${i.details ? `\nAdditional details: ${i.details}\n` : ""}\nInclude a subject line (prefixed with "Subject:"), a sincere thank you, a specific detail that makes it feel personal, and an appropriate closing.`;

    case "ai-text-improver":
      return `Improve the clarity, flow, and word choice of the following text while preserving its original meaning and intent. Fix awkward phrasing and tighten wordy sentences.\n\nText:\n${i.text}`;

    case "ai-tone-changer":
      return `Rewrite the following text in a ${i.tone || "Formal"} tone, keeping the same core meaning and information.\n\nOriginal text:\n${i.text}`;

    case "ai-expand-text":
      return `Expand the following text into a longer, more detailed version by adding relevant explanation, examples, or context, while keeping the original meaning and tone.\n\nOriginal text:\n${i.text}`;

    case "ai-shorten-text":
      return `Condense the following text into a shorter, punchier version while keeping the essential meaning and key points intact. Remove redundancy and filler words.\n\nOriginal text:\n${i.text}`;

    case "ai-proofreader":
      return `Proofread the following text thoroughly. Check grammar, spelling, punctuation, clarity, tone consistency, and word choice.\n\nProvide:\n1. The fully corrected version\n2. A list of every change made with a brief explanation\n\nText:\n${i.text}`;

    case "ai-ghostwriting":
      return `Write a polished, ready-to-publish ${i.type || "Blog Article"} about the following topic/brief in a ${i.tone || "Professional"} voice:\n\n${i.topic}\n\nDeliver well-structured, engaging content that reads as if written by a seasoned human author. Match the content length and format appropriate for the selected type.`;

    case "ai-math-solver":
      return `Solve the following math problem step by step with clear explanations.\n\nProblem:\n${i.problem}\n\nProvide:\n1. **Identify the problem type** — what branch of math this belongs to (algebra, geometry, calculus, etc.)\n2. **List key formulas** — relevant equations or theorems\n3. **Step-by-step solution** — show all working clearly\n4. **Final answer** — clearly state the result\n5. **Explanation** — why each step works, common mistakes to avoid\n\nMake it educational and easy to follow for a student.`;

    case "ai-jamb-cbt-practice":
      return `Generate 10 realistic JAMB CBT practice questions for the subject: "${i.subject}".\n\nFor EACH question provide:\n\n**Question [N]:** [The question text]\n\n**A)** [Option A]\n**B)** [Option B]\n**C)** [Option C]\n**D)** [Option D]\n\n**Correct Answer:** [A/B/C/D]\n**Explanation:** [Why this is correct and why other options are wrong - helps learning]\n\n---\n\nMake questions realistic to actual JAMB exams, vary difficulty levels, and focus on core concepts covered in the curriculum.`;

    case "ai-event-assistant":
      return `Create a polished, production-ready event toolkit for a ${i.event_type || "special"} event${i.event_name ? ` named "${i.event_name}"` : ""}${i.theme ? ` with the theme "${i.theme}"` : ""}.

Event details:
- Purpose: ${i.event_purpose || "Not specified"}
- Date: ${i.event_date || "Not specified"}
- Time: ${i.start_time || "Not specified"}${i.end_time ? ` to ${i.end_time}` : ""}
- Venue: ${i.venue || "Not specified"}
- City/Country: ${i.city || "Not specified"}${i.country ? `, ${i.country}` : ""}
- Budget: ${i.budget || "Flexible"}${i.currency ? ` ${i.currency}` : ""}
- Expected guests: ${i.guest_count || "Flexible"}
- Audience: ${i.audience || "General audience"}
- Tone: ${i.tone || "Professional"}
- Dress code: ${i.dress_code || "Not specified"}
- Special requirements: ${i.special_requirements || "None"}
- Additional notes: ${i.additional_notes || "None"}

${i.section_focus ? `Focus on the section titled "${i.section_focus}" and write it as a detailed, practical subsection with clear bullet points and a polished tone.` : "Create a complete toolkit with the following sections and include enough details for execution:"}

${i.section_focus ? "" : `1. Event Overview
2. Event Timeline
3. Budget Planner
4. Event Checklist
5. Shopping List
6. Vendor Suggestions
7. Invitation Generator
8. Event Description
9. Social Media Promotion
10. Email Campaign
11. Speech Generator
12. Event Hashtags
13. Seating Planner
14. Risk & Contingency
15. AI Recommendations
`}

Format the response as markdown with clear headings. Use practical, stylish, and easy-to-execute language. Keep each section detailed but concise enough to be immediately useful.`;

    case "ai-event-itinerary":
      return `Create a clear event itinerary for "${i.event_name}" with the following flow notes:

${i.flow}

Include a timeline with suggested start/end times, transitions, key moments, and hosting notes. The tone should feel ${i.tone || "energetic"} and the plan should be easy to follow.`;

    case "ai-event-checklist":
      return `Create a practical planning checklist for "${i.event_name}" for a ${i.timeline || "flexible"} timeline.

Specific needs:
${i.details || "None provided"}

Organize the checklist into planning phases: early prep, mid planning, final week, and day-of. Include both admin tasks and execution tasks.`;

    case "ai-event-invitation":
      return `Write a polished event invitation for "${i.event_name}" aimed at ${i.audience || "guests"}.

Tone: ${i.tone || "warm"}
Additional details: ${i.details || "None provided"}

Return a short invitation message with a warm opening, key event details, and a polished sign-off. Keep it concise and ready to copy into a message or card.`;

    case "ai-practice-questions":
      return `Generate ${i.count || "10"} practice questions about "${i.topic}" for ${i.exam || "a general exam"}. Difficulty: ${i.difficulty || "Mixed"}.

For each question provide:
1. The question text
2. 4 options (A-D) where relevant
3. The correct answer
4. A brief explanation

Make the questions clear, varied, and useful for studying.`;

    case "ai-mock-exam-generator":
      return `Create a ${i.duration || "60 minutes"} mock exam on "${i.topic}" with ${i.count || "10"} questions. Difficulty: ${i.difficulty || "Mixed"}.

Structure the exam with:
1. Clear instructions
2. Questions in a realistic exam style
3. Answer key
4. Brief scoring guidance and study tips

Make it suitable for self-testing and revision.`;

    case "ai-tutor-chat":
      return `Act as a patient tutor and explain the topic: "${i.topic}" for a ${i.level || "Beginner"} learner.

The learner asks: "${i.question}"

Provide:
1. A clear explanation
2. A simple example
3. A step-by-step breakdown if needed
4. A follow-up question or next step for deeper learning

Keep the tone encouraging and easy to follow.`;

    case "ai-flashcard-generator":
      return `Create ${i.count || "15"} flashcards for the topic "${i.topic}" for a ${i.level || "Intermediate"} learner.

Format each flashcard as:
Front: [term/question]
Back: [definition/answer]

Make the cards focused on the most important concepts and useful for revision.`;

    case "ai-study-notes-generator":
      return `Create ${i.format || "Detailed Notes"} for the topic "${i.topic}" for a ${i.level || "Intermediate"} learner.

Include:
1. Key concepts
2. Important definitions
3. Example points
4. Quick summary bullets
5. Helpful memory tips

Make the notes organized, concise, and revision-friendly.`;

    case "ai-weak-topic-analyzer":
      return `Analyze the weak areas for the subject/topic "${i.topic}" based on the following performance notes:

${i.details}

Provide:
1. The main weak topics or recurring gaps
2. Why they might be challenging
3. A targeted study plan to improve them
4. Suggested practice exercises

Make the response practical and encouraging.`;

    case "ai-study-planner":
      return `Create a study plan for the goal "${i.topic}" with a target date of ${i.date || "soon"} and ${i.hours || "2 hours"} of daily study time.

Include:
1. A weekly study schedule
2. Daily focus areas
3. Revision checkpoints
4. A realistic roadmap to reach the goal

Make the plan balanced and manageable.`;

    case "ai-previous-question-generator":
      return `Generate ${i.count || "10"} exam-style questions on "${i.topic}" for ${i.exam || "the relevant exam"}.

For each question provide:
1. The question text
2. A short answer key or marking note
3. A brief explanation

Make the questions realistic and exam-focused.`;

    case "ai-performance-analytics":
      return `Analyze the following study/performance data for "${i.topic}":

${i.details}

Provide:
1. Overall strengths
2. Weaknesses and recurring issues
3. Suggested improvement priorities
4. A short readiness summary

Make it useful for planning the next study phase.`;

    case "ai-pdf-practice-papers":
      return `Create a printable practice paper for "${i.topic}" at ${i.level || "an intermediate level"} with ${i.count || "1"} paper version(s).

Include:
1. A clean question paper layout
2. A short instructions section
3. An answer key and marking notes
4. A brief study tip section

Format it so it can be copied into a PDF-ready document.`;

    case "ai-daily-practice":
      return `Create a daily practice routine for the topic "${i.topic}" with a goal of ${i.goal || "20 minutes"}. Difficulty: ${i.difficulty || "Moderate"}.

Include:
1. One short practice task
2. One challenge question
3. One revision reminder
4. A motivational closing note

Make it simple enough to follow every day.`;

    case "ai-essay-generator":
      return `Generate a polished essay draft about: "${i.topic}"\nStyle: ${i.style || "Academic"}\n\nInclude:\n1. Engaging introduction with thesis statement\n2. 3-4 well-developed body paragraphs with clear arguments\n3. Topic sentences and supporting evidence\n4. Smooth transitions between paragraphs\n5. Strong conclusion that reinforces the thesis\n\nMake it academic and well-structured for submission.`;

    case "ai-story-writer":
      return `Write a creative short story based on this prompt: "${i.prompt}"\nTone: ${i.tone || "Engaging"}\n\nInclude:\n1. An engaging opening that sets the scene\n2. Compelling characters and their motivations\n3. A clear conflict or tension\n4. Plot development with rising action\n5. A satisfying conclusion or twist\n\nMake it vivid, descriptive, and emotionally engaging.`;

    case "ai-book-outline-generator":
      return `Create a detailed book structure for: "${i.topic}"\n\nProvide:\n1. A compelling book title and subtitle\n2. Target audience description\n3. Main theme/thesis\n4. Chapter-by-chapter outline (10-15 chapters)\n5. Key points under each chapter\n6. Estimated word count per chapter\n\nMake it comprehensive enough to serve as a writing roadmap.`;

    case "ai-chapter-generator":
      return `Draft a chapter for a book about: "${i.topic}"\nChapter title/theme: ${i.chapter || "not specified"}\n\nProvide:\n1. An engaging chapter introduction\n2. 3-4 major sections with clear subheadings\n3. Supporting details, examples, and explanations\n4. A chapter summary or conclusion\n\nMake it approximately 2,000-3,000 words and well-structured.`;

    case "ai-speech-writer":
      return `Write a compelling speech about: "${i.topic}"\nAudience: ${i.audience || "general audience"}\n\nInclude:\n1. A powerful opening hook\n2. Clear main points (2-3) with supporting examples\n3. Emotional connection or relatability\n4. Smooth transitions between ideas\n5. A memorable closing call-to-action or conclusion\n\nMake it engaging and suitable for public speaking.`;

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: is this a fallback-worthy error? (quota / rate-limit across all
// providers — matches the patterns that ai-service.ts surfaces upward when
// the entire chain is exhausted.)
// ---------------------------------------------------------------------------
function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes("all ai providers") ||
    m.includes("quota")            ||
    m.includes("resource_exhausted") ||
    m.includes("rate_limit")       ||
    m.includes("rate limit")       ||
    m.includes("429")
  );
}

function getSafeStatus(err: unknown): number {
  if (err && typeof err === "object") {
    const status = (err as { status?: number }).status;
    if (typeof status === "number") return status;
    const code = (err as { code?: number }).code;
    if (typeof code === "number") return code;
  }

  if (!(err instanceof Error)) return 500;

  const m = err.message.toLowerCase();
  if (m.includes("timed out") || m.includes("timeout")) return 504;
  if (m.includes("api key") || m.includes("apikey") || m.includes("not set")) return 401;
  if (m.includes("quota") || m.includes("resource_exhausted") || m.includes("rate_limit") || m.includes("rate limit") || m.includes("too many requests") || m.includes("429")) return 429;
  if (m.includes("model") && (m.includes("not found") || m.includes("not_found"))) return 404;
  if (m.includes("malformed") || m.includes("invalid") || m.includes("unknown tool")) return 400;
  if (m.includes("safety") || m.includes("blocked")) return 422;
  if (m.includes("network") || m.includes("connection") || m.includes("fetch failed") || m.includes("socket hang up") || m.includes("econnreset") || m.includes("econnrefused") || m.includes("etimedout")) return 503;
  if (m.includes("empty response")) return 502;
  return 500;
}

function getSafeClientMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Generation failed. Please try again.";

  const m = err.message.toLowerCase();
  if (m.includes("timed out") || m.includes("timeout")) return "AI request timed out.";
  if (m.includes("unauthorized") || m.includes("forbidden") || m.includes("invalid key") || m.includes("invalid api key")) return "AI provider authentication failed. Please check the configured API key.";
  if (m.includes("api key") || m.includes("apikey") || m.includes("not set")) return "The AI provider is not configured for this environment.";
  if (m.includes("quota") || m.includes("resource_exhausted") || m.includes("rate_limit") || m.includes("rate limit") || m.includes("too many requests") || m.includes("429")) return "AI rate limit exceeded. Please try again later.";
  if (m.includes("model") && (m.includes("not found") || m.includes("not_found"))) return "The selected AI model is unavailable.";
  if (m.includes("malformed") || m.includes("invalid") || m.includes("unknown tool")) return "The request payload is invalid.";
  if (m.includes("safety") || m.includes("blocked")) return "The request was blocked by the provider safety policy.";
  if (m.includes("network") || m.includes("connection") || m.includes("fetch failed") || m.includes("socket hang up") || m.includes("econnreset") || m.includes("econnrefused") || m.includes("etimedout")) return "The AI provider could not be reached. Please try again.";
  if (m.includes("empty response")) return "The AI provider returned an empty response.";
  return "Generation failed. Please try again.";
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
router.post("/ai/generate", aiLimiter, async (req, res) => {
  const requestId = String(req.id ?? Math.random().toString(36).slice(2, 8));
  const tRequestStart = nowMs();
  const timings: Record<string, number> = {};
  const requestBodySnapshot = req.body;
  let resolvedToolId: string | undefined;
  let resolvedModel: string | undefined;

  logger.info(
    {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ts: new Date().toISOString(),
    },
    `[ai/generate][${requestId}] request received`,
  );

  try {
    if (!req.body || typeof req.body !== "object") {
      logger.warn({ requestId }, `[ai/generate][${requestId}] missing or malformed JSON body`);
      res.status(400).json({ success: false, message: "Request body must be a JSON object." });
      return;
    }

    const { toolId, inputs } = req.body as {
      toolId: unknown;
      inputs: unknown;
    };
    resolvedToolId = typeof toolId === "string" ? toolId.trim() : undefined;

    // ---- Stage 1: validation ------------------------------------------------
    const tValidateStart = nowMs();

    // Basic shape validation
    if (typeof toolId !== "string" || !toolId.trim()) {
      res.status(400).json({ success: false, message: "toolId is required." });
      return;
    }
    if (typeof inputs !== "object" || inputs === null || Array.isArray(inputs)) {
      res.status(400).json({ success: false, message: "inputs must be an object." });
      return;
    }

    const schema = TOOL_SCHEMAS[toolId];
    if (!schema) {
      res.status(400).json({ success: false, message: "Unknown tool." });
      return;
    }

    const safeInputs = inputs as Record<string, unknown>;

    // Validate required fields
    for (const key of schema.required) {
      const val = safeInputs[key];
      if (typeof val !== "string" || !val.trim()) {
        res.status(400).json({ success: false, message: `Missing required field: ${key}` });
        return;
      }
    }

    // Enforce max lengths and sanitize to strings
    const cleanInputs: Record<string, string> = {};
    for (const [key, maxLen] of Object.entries(schema.maxLengths)) {
      const val = safeInputs[key];
      if (typeof val === "string") {
        if (val.length > maxLen) {
          res.status(400).json({ success: false, message: `Input "${key}" exceeds maximum length of ${maxLen} characters.` });
          return;
        }
        cleanInputs[key] = val;
      }
    }
    // Allow select/enum fields not covered by maxLengths (always short strings)
    for (const [key, val] of Object.entries(safeInputs)) {
      if (!(key in cleanInputs) && typeof val === "string" && val.length <= 200) {
        cleanInputs[key] = val;
      }
    }
    timings.validateMs = nowMs() - tValidateStart;

    logger.info(
      {
        requestId,
        toolId,
        inputKeys: Object.keys(cleanInputs),
        timingMs: Number(timings.validateMs.toFixed(1)),
        ts: new Date().toISOString(),
      },
      `[ai/generate][${requestId}] request validation complete`,
    );

    // ---- Stage 2: prompt preparation ---------------------------------------
    const tPromptStart = nowMs();
    const prompt = compactPrompt(buildPrompt(toolId, cleanInputs) ?? "");
    timings.promptMs = nowMs() - tPromptStart;

    if (!prompt) {
      res.status(400).json({ success: false, message: "Could not build prompt for this tool." });
      return;
    }

    const promptTokensEst = Math.ceil(prompt.length / 4);
    const isComplex = COMPLEX_TOOL_IDS.has(toolId);
    const selectedMaxOutputTokens = getOutputTokenBudget(toolId);

    logger.info(
      {
        requestId,
        toolId,
        promptChars: prompt.length,
        promptTokensEst,
        isComplex,
        selectedMaxOutputTokens,
        ts: new Date().toISOString(),
      },
      `[perf][ai/generate][${requestId}] prompt ready (validate=${timings.validateMs.toFixed(1)}ms, build=${timings.promptMs.toFixed(1)}ms)`,
    );

    // ---- Stage 3: AI generation — delegates to the resilient service layer --
    // Tries Gemini → Groq → OpenRouter with per-provider timeouts, automatic
    // retries for transient errors, and structured per-attempt logging.
    // See lib/ai-service.ts for the full pipeline.
    const tAiStart = nowMs();

    logger.info(
      {
        requestId,
        toolId,
        providerOrder: ["agentrouter", "gemini", "groq", "openrouter"],
        isComplex,
        selectedMaxOutputTokens,
        ts: new Date().toISOString(),
      },
      `[ai/generate][${requestId}] provider chain selected`,
    );

    const { result: aiResult, attempts: providerAttempts } = await generateText({
      prompt,
      toolId,
      maxOutputTokens: selectedMaxOutputTokens,
      isComplex,
      requestId,
    });

    resolvedModel = aiResult.model;
    const resultText   = aiResult.text;
    const finishReason = aiResult.finishReason;
    const providerUsed = aiResult.provider;

    timings.aiMs = nowMs() - tAiStart;
    logger.info(
      {
        requestId,
        provider: providerUsed,
        model: aiResult.model,
        aiMs: Number(timings.aiMs.toFixed(1)),
        outputChars: resultText.length,
        usage: aiResult.usage,
        providerAttempts,
        ts: new Date().toISOString(),
      },
      `[perf][ai/generate][${requestId}] ← ${providerUsed}/${aiResult.model} in ${timings.aiMs.toFixed(1)}ms`,
    );

    // ---- Stage 4: response processing/serialization ------------------------
    const tSerializeStart = nowMs();

    // Check whether generation was blocked before reading the text. When
    // Gemini hits a safety filter or recitation block the text is empty but
    // no exception is thrown — without this check the client silently gets
    // an empty 200, with no indication that content was blocked.
    //
    // Normalise finish reasons across providers:
    //   Gemini        → "STOP" | "MAX_TOKENS" | "SAFETY" | "RECITATION" …
    //   OpenAI-compat → "stop" | "length" | "content_filter" …  (lowercase)
    //
    // Treat both the Gemini and OpenAI-compat success reasons as non-blocking
    // so Groq / OpenRouter / AgentRouter responses are never mis-classified.
    const normalizedFinishReason = typeof finishReason === "string"
      ? finishReason.toUpperCase()
      : finishReason;

    const SUCCESS_FINISH_REASONS = new Set(["STOP", "MAX_TOKENS", "LENGTH"]);
    if (normalizedFinishReason && !SUCCESS_FINISH_REASONS.has(normalizedFinishReason)) {
      logger.warn(
        { requestId, toolId, finishReason, ts: new Date().toISOString() },
        `[perf][ai/generate][${requestId}] generation blocked`,
      );
      res.status(422).json({
        success: false,
        message:
          finishReason === "SAFETY"
            ? "The request was blocked by safety filters. Please rephrase your input."
            : "Generation was stopped before completing. Please try again.",
      });
      return;
    }

    if (!resultText) {
      logger.warn(
        { requestId, toolId, provider: providerUsed },
        `[ai/generate][${requestId}] ${providerUsed} response was empty`,
      );
    }

    logger.info(
      {
        requestId,
        provider: providerUsed,
        resultChars: resultText.length,
        finishReason,
        ts: new Date().toISOString(),
      },
      `[ai/generate][${requestId}] response parsed`,
    );

    const payload = { result: resultText };
    timings.serializeMs = nowMs() - tSerializeStart;

    timings.totalMs = nowMs() - tRequestStart;
    logger.info(
      {
        requestId,
        toolId,
        provider: providerUsed,
        resultChars: resultText.length,
        validateMs: Number(timings.validateMs.toFixed(1)),
        promptMs: Number(timings.promptMs.toFixed(1)),
        aiMs: Number(timings.aiMs.toFixed(1)),
        serializeMs: Number(timings.serializeMs.toFixed(1)),
        totalServerMs: Number(timings.totalMs.toFixed(1)),
        aiShareOfTotalPct: Number(((timings.aiMs / timings.totalMs) * 100).toFixed(1)),
        ts: new Date().toISOString(),
      },
      `[perf][ai/generate][${requestId}] DONE — total=${timings.totalMs.toFixed(1)}ms ` +
        `(validate=${timings.validateMs.toFixed(1)}ms, prompt=${timings.promptMs.toFixed(1)}ms, ` +
        `${providerUsed}=${timings.aiMs.toFixed(1)}ms, serialize=${timings.serializeMs.toFixed(1)}ms)`,
    );

    logger.info(
      {
        requestId,
        provider: providerUsed,
        payloadChars: resultText.length,
        ts: new Date().toISOString(),
      },
      `[ai/generate][${requestId}] response returned`,
    );

    res.json(payload);
  } catch (err) {
    timings.totalMs = nowMs() - tRequestStart;
    const stack = err instanceof Error ? err.stack : undefined;
    const errorName = err instanceof Error ? err.name : undefined;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorCode = (err as { code?: unknown })?.code;
    const errorStatus = (err as { status?: unknown })?.status;
    const serverStatus = getSafeStatus(err);
    const clientMessage = getSafeClientMessage(err);

    // Extract provider SDK fields (Groq/OpenAI SDK: .status, .error, .headers).
    // These are not part of the standard Error interface but contain the raw
    // provider response body — the most useful field for diagnosing a 500.
    const sdkErr = err && typeof err === "object" ? (err as Record<string, unknown>) : {};
    const sdkResponseBody = sdkErr["error"] ?? sdkErr["response"] ?? sdkErr["body"] ?? undefined;
    const sdkHeaders = sdkErr["headers"] ?? undefined;

    logger.error(
      {
        requestId,
        toolId: resolvedToolId,
        model: resolvedModel,
        requestBody: requestBodySnapshot,
        errorName,
        message: errorMessage,
        stack,
        cause: (err as { cause?: unknown }).cause,
        response: (err as { response?: unknown }).response,
        errorCode,
        httpStatus: errorStatus ?? serverStatus,
        sdkResponseBody,
        sdkHeaders,
        totalServerMs: Number(timings.totalMs.toFixed(1)),
        stageReachedMs: timings,
        ts: new Date().toISOString(),
      },
      `[ai/generate][${requestId}] FAILED after ${timings.totalMs.toFixed(1)}ms — ${errorName ?? "Error"}: ${errorMessage.slice(0, 200)}`,
    );

    res.status(serverStatus).json({ success: false, message: clientMessage });
  }
});

export default router;
