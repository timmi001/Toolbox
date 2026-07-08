import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";

const router = Router();

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
  "ai-study-notes":        { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-quiz-generator":     { required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-flashcard-generator":{ required: ["topic"],      maxLengths: { topic: 300 } },
  "ai-interview-questions":{ required: ["role"],       maxLengths: { role: 200 } },
  "ai-meeting-notes":      { required: ["transcript"], maxLengths: { transcript: 20000 } },
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
      return `Generate ${i.count || "15"} ${i.type || "Mixed"} interview questions for a ${i.level || "Mid"}-level ${i.role} position.\n\nFor each question:\n1. The interview question\n2. What skill/quality it assesses\n3. A strong answer framework or key points to cover\n\nInclude a mix of behavioral (STAR format), situational, and technical questions appropriate for the role and seniority level.`;

    case "ai-meeting-notes":
      return `Convert the following meeting content into professional, structured meeting notes:\n\n${i.transcript}\n\nFormat as:\n## Meeting Notes\n\n**Date:** [if mentioned]\n**Attendees:** [if mentioned]\n\n### Key Discussion Points\n[Organized bullet points]\n\n### Decisions Made\n[Clear list of decisions]\n\n### Action Items\n| Owner | Task | Deadline |\n[Table of action items]\n\n### Next Steps\n[Summary of follow-ups]\n\nMake the notes clear, professional, and scannable.`;

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

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
router.post("/ai/generate", aiLimiter, async (req, res) => {
  try {
    const { toolId, inputs } = req.body as {
      toolId: unknown;
      inputs: unknown;
    };

    // Basic shape validation
    if (typeof toolId !== "string" || !toolId.trim()) {
      res.status(400).json({ error: "toolId is required." });
      return;
    }
    if (typeof inputs !== "object" || inputs === null || Array.isArray(inputs)) {
      res.status(400).json({ error: "inputs must be an object." });
      return;
    }

    const schema = TOOL_SCHEMAS[toolId];
    if (!schema) {
      res.status(400).json({ error: "Unknown tool." });
      return;
    }

    const safeInputs = inputs as Record<string, unknown>;

    // Validate required fields
    for (const key of schema.required) {
      const val = safeInputs[key];
      if (typeof val !== "string" || !val.trim()) {
        res.status(400).json({ error: `Missing required field: ${key}` });
        return;
      }
    }

    // Enforce max lengths and sanitize to strings
    const cleanInputs: Record<string, string> = {};
    for (const [key, maxLen] of Object.entries(schema.maxLengths)) {
      const val = safeInputs[key];
      if (typeof val === "string") {
        if (val.length > maxLen) {
          res.status(400).json({ error: `Input "${key}" exceeds maximum length of ${maxLen} characters.` });
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

    const prompt = buildPrompt(toolId, cleanInputs);
    if (!prompt) {
      res.status(400).json({ error: "Could not build prompt for this tool." });
      return;
    }

    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      res.status(503).json({ error: "AI service is not configured." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { maxOutputTokens: 8192 },
    });

    res.json({ result: response.text ?? "" });
  } catch (err) {
    // Don't leak internal/upstream error strings — log server-side, return generic message
    const isKnown = err instanceof Error && (
      err.message.includes("API_KEY") ||
      err.message.includes("quota") ||
      err.message.includes("RESOURCE_EXHAUSTED")
    );
    const clientMessage = isKnown
      ? "API quota exceeded. Please try again later."
      : "Generation failed. Please try again.";
    res.status(500).json({ error: clientMessage });
  }
});

export default router;
