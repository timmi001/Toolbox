export type FieldType = "text" | "textarea" | "select";

export interface AiField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
}

export interface AiToolConfig {
  toolId: string;
  /** Label shown on the generate button */
  buttonLabel?: string;
  fields: AiField[];
}

const configs: Record<string, AiToolConfig> = {
  "ai-writer": {
    toolId: "ai-writer",
    buttonLabel: "Generate Article",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. The future of renewable energy", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Academic", "Creative", "Persuasive"] },
      { key: "length", label: "Length", type: "select", options: ["Short (~300 words)", "Medium (~600 words)", "Long (~1000 words)"] },
    ],
  },
  "ai-summarizer": {
    toolId: "ai-summarizer",
    buttonLabel: "Summarize",
    fields: [
      { key: "text", label: "Text to Summarize", type: "textarea", placeholder: "Paste your article, document, or text here...", required: true, rows: 8 },
      { key: "style", label: "Summary Format", type: "select", options: ["Paragraph", "Bullet Points", "One Line"] },
      { key: "length", label: "Detail Level", type: "select", options: ["Brief", "Moderate", "Detailed"] },
    ],
  },
  "ai-paraphraser": {
    toolId: "ai-paraphraser",
    buttonLabel: "Paraphrase",
    fields: [
      { key: "text", label: "Text to Paraphrase", type: "textarea", placeholder: "Enter the text you want to paraphrase...", required: true, rows: 6 },
      { key: "style", label: "Style", type: "select", options: ["Standard", "Formal", "Casual", "Creative", "Simpler"] },
    ],
  },
  "ai-grammar-checker": {
    toolId: "ai-grammar-checker",
    buttonLabel: "Check Grammar",
    fields: [
      { key: "text", label: "Text to Check", type: "textarea", placeholder: "Paste your text here to check for grammar, spelling, and punctuation errors...", required: true, rows: 8 },
    ],
  },
  "ai-humanizer": {
    toolId: "ai-humanizer",
    buttonLabel: "Humanize Text",
    fields: [
      { key: "text", label: "AI Text to Humanize", type: "textarea", placeholder: "Paste AI-generated text here to make it sound more human...", required: true, rows: 7 },
      { key: "style", label: "Writing Style", type: "select", options: ["Natural", "Conversational", "Engaging", "Academic"] },
    ],
  },
  "ai-email-writer": {
    toolId: "ai-email-writer",
    buttonLabel: "Write Email",
    fields: [
      { key: "type", label: "Email Type", type: "select", options: ["Professional", "Follow-up", "Thank You", "Cold Outreach", "Complaint", "Inquiry"], required: true },
      { key: "recipient", label: "Recipient (name/role)", type: "text", placeholder: "e.g. Hiring Manager, John Smith, Customer Support" },
      { key: "purpose", label: "Purpose / Context", type: "textarea", placeholder: "Describe what this email is about...", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Formal", "Friendly", "Direct", "Empathetic"] },
    ],
  },
  "ai-resume-builder": {
    toolId: "ai-resume-builder",
    buttonLabel: "Build Resume",
    fields: [
      { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Jane Doe", required: true },
      { key: "target_role", label: "Target Job Title", type: "text", placeholder: "e.g. Senior Software Engineer", required: true },
      { key: "current_role", label: "Current / Most Recent Role", type: "text", placeholder: "e.g. Software Engineer at Acme Corp (2021–2024)" },
      { key: "experience", label: "Work Experience", type: "textarea", placeholder: "Describe your key roles, responsibilities, and achievements...", required: true, rows: 5 },
      { key: "skills", label: "Key Skills", type: "text", placeholder: "e.g. React, Node.js, Python, Project Management", required: true },
      { key: "education", label: "Education", type: "text", placeholder: "e.g. B.Sc. Computer Science, MIT, 2019" },
    ],
  },
  "ai-cover-letter": {
    toolId: "ai-cover-letter",
    buttonLabel: "Generate Cover Letter",
    fields: [
      { key: "name", label: "Your Name", type: "text", placeholder: "e.g. Jane Doe", required: true },
      { key: "target_role", label: "Job Title", type: "text", placeholder: "e.g. Product Manager", required: true },
      { key: "company", label: "Company Name", type: "text", placeholder: "e.g. Stripe", required: true },
      { key: "experience", label: "Relevant Experience", type: "textarea", placeholder: "Briefly describe your most relevant experience...", required: true, rows: 4 },
      { key: "skills", label: "Key Skills / Strengths", type: "text", placeholder: "e.g. leadership, data analysis, cross-team collaboration" },
    ],
  },
  "ai-business-name": {
    toolId: "ai-business-name",
    buttonLabel: "Generate Names",
    fields: [
      { key: "industry", label: "Industry", type: "text", placeholder: "e.g. SaaS, Coffee Shop, Fashion, Healthcare", required: true },
      { key: "keywords", label: "Keywords / Themes", type: "text", placeholder: "e.g. fast, creative, trust, green, local" },
      { key: "style", label: "Name Style", type: "select", options: ["Modern", "Classic", "Playful", "Professional", "Creative", "Minimal"] },
    ],
  },
  "ai-slogan-generator": {
    toolId: "ai-slogan-generator",
    buttonLabel: "Generate Slogans",
    fields: [
      { key: "business_name", label: "Business Name", type: "text", placeholder: "e.g. BoltPay", required: true },
      { key: "industry", label: "Industry / Niche", type: "text", placeholder: "e.g. fintech, coffee, fitness", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Inspiring", "Witty", "Professional", "Bold", "Friendly", "Minimalist"] },
    ],
  },
  "ai-product-description": {
    toolId: "ai-product-description",
    buttonLabel: "Generate Description",
    fields: [
      { key: "product", label: "Product Name", type: "text", placeholder: "e.g. Wireless Noise-Cancelling Headphones", required: true },
      { key: "features", label: "Key Features", type: "textarea", placeholder: "List the main features and specs...", required: true, rows: 4 },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. remote workers, students, audiophiles" },
      { key: "tone", label: "Tone", type: "select", options: ["Persuasive", "Technical", "Casual", "Luxury", "Minimalist"] },
    ],
  },
  "ai-seo-title": {
    toolId: "ai-seo-title",
    buttonLabel: "Generate Titles",
    fields: [
      { key: "topic", label: "Page Topic / Subject", type: "text", placeholder: "e.g. best project management tools for remote teams", required: true },
      { key: "keywords", label: "Target Keywords", type: "text", placeholder: "e.g. project management, remote work, team tools" },
    ],
  },
  "ai-meta-description": {
    toolId: "ai-meta-description",
    buttonLabel: "Generate Meta Descriptions",
    fields: [
      { key: "topic", label: "Page Topic / Subject", type: "text", placeholder: "e.g. guide to intermittent fasting for beginners", required: true },
      { key: "keywords", label: "Target Keywords", type: "text", placeholder: "e.g. intermittent fasting, weight loss, beginner guide" },
    ],
  },
  "ai-keyword-generator": {
    toolId: "ai-keyword-generator",
    buttonLabel: "Generate Keywords",
    fields: [
      { key: "topic", label: "Topic / Seed Keyword", type: "text", placeholder: "e.g. email marketing", required: true },
      { key: "niche", label: "Industry / Niche", type: "text", placeholder: "e.g. B2B SaaS, e-commerce, fitness" },
    ],
  },
  "ai-sql-generator": {
    toolId: "ai-sql-generator",
    buttonLabel: "Generate SQL",
    fields: [
      { key: "description", label: "Query Description", type: "textarea", placeholder: "e.g. Get all users who signed up in the last 30 days and have made at least one purchase", required: true, rows: 4 },
      { key: "schema", label: "Database Schema (optional)", type: "textarea", placeholder: "e.g. users(id, email, created_at), orders(id, user_id, total, created_at)", rows: 4 },
    ],
  },
  "ai-regex-generator": {
    toolId: "ai-regex-generator",
    buttonLabel: "Generate Regex",
    fields: [
      { key: "description", label: "Pattern Description", type: "textarea", placeholder: "e.g. Match a valid email address, or match all US phone numbers in format (XXX) XXX-XXXX", required: true, rows: 4 },
    ],
  },
  "ai-code-explainer": {
    toolId: "ai-code-explainer",
    buttonLabel: "Explain Code",
    fields: [
      { key: "language", label: "Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "SQL", "Bash", "Other"] },
      { key: "code", label: "Code to Explain", type: "textarea", placeholder: "Paste your code here...", required: true, rows: 10 },
    ],
  },
  "ai-code-reviewer": {
    toolId: "ai-code-reviewer",
    buttonLabel: "Review Code",
    fields: [
      { key: "language", label: "Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "SQL", "Bash", "Other"] },
      { key: "code", label: "Code to Review", type: "textarea", placeholder: "Paste your code here...", required: true, rows: 10 },
    ],
  },
  "ai-bug-finder": {
    toolId: "ai-bug-finder",
    buttonLabel: "Find Bugs",
    fields: [
      { key: "language", label: "Language", type: "select", options: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "SQL", "Bash", "Other"] },
      { key: "code", label: "Code to Analyze", type: "textarea", placeholder: "Paste the code you want to check for bugs...", required: true, rows: 10 },
    ],
  },
  "ai-json-formatter": {
    toolId: "ai-json-formatter",
    buttonLabel: "Format & Explain",
    fields: [
      { key: "json", label: "JSON Input", type: "textarea", placeholder: "Paste your JSON here (valid or invalid)...", required: true, rows: 10 },
    ],
  },
  "ai-study-notes": {
    toolId: "ai-study-notes",
    buttonLabel: "Generate Study Notes",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. Photosynthesis, World War II, Machine Learning", required: true },
      { key: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
      { key: "format", label: "Notes Format", type: "select", options: ["Detailed Notes", "Outline", "Summary"] },
    ],
  },
  "ai-quiz-generator": {
    toolId: "ai-quiz-generator",
    buttonLabel: "Generate Quiz",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. Ancient Rome, JavaScript Promises, Human Anatomy", required: true },
      { key: "count", label: "Number of Questions", type: "select", options: ["5", "10", "15", "20"] },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Mixed"] },
    ],
  },
  "ai-flashcard-generator": {
    toolId: "ai-flashcard-generator",
    buttonLabel: "Generate Flashcards",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. Spanish vocabulary, React hooks, Periodic table", required: true },
      { key: "count", label: "Number of Cards", type: "select", options: ["10", "15", "20", "25", "30"] },
    ],
  },
  "ai-interview-questions": {
    toolId: "ai-interview-questions",
    buttonLabel: "Generate Questions",
    fields: [
      { key: "role", label: "Job Role / Position", type: "text", placeholder: "e.g. Frontend Engineer, Product Manager, Data Scientist", required: true },
      { key: "level", label: "Experience Level", type: "select", options: ["Entry", "Mid", "Senior", "Lead / Principal"] },
      { key: "type", label: "Question Type", type: "select", options: ["Technical", "Behavioral", "Mixed"] },
      { key: "count", label: "Number of Questions", type: "select", options: ["10", "15", "20"] },
    ],
  },
  "ai-meeting-notes": {
    toolId: "ai-meeting-notes",
    buttonLabel: "Generate Meeting Notes",
    fields: [
      { key: "transcript", label: "Meeting Transcript / Raw Notes", type: "textarea", placeholder: "Paste your meeting transcript or rough notes here...", required: true, rows: 10 },
    ],
  },
  "ai-hashtag-generator": {
    toolId: "ai-hashtag-generator",
    buttonLabel: "Generate Hashtags",
    fields: [
      { key: "topic", label: "Topic / Content Description", type: "text", placeholder: "e.g. morning workout routine, travel photography in Japan", required: true },
      { key: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "Twitter / X", "LinkedIn", "All Platforms"] },
      { key: "count", label: "Number of Hashtags", type: "select", options: ["20", "30", "40", "50"] },
    ],
  },
  "ai-youtube-title": {
    toolId: "ai-youtube-title",
    buttonLabel: "Generate Titles",
    fields: [
      { key: "topic", label: "Video Topic", type: "text", placeholder: "e.g. How I built a SaaS app in 30 days", required: true },
      { key: "style", label: "Title Style", type: "select", options: ["Clickbait", "Educational", "Listicle", "How-to", "Story / Personal", "Challenge"] },
    ],
  },
  "ai-instagram-caption": {
    toolId: "ai-instagram-caption",
    buttonLabel: "Generate Captions",
    fields: [
      { key: "topic", label: "Post Topic / Description", type: "text", placeholder: "e.g. sunset hike at Yosemite, new product launch, morning coffee routine", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Casual", "Fun", "Inspiring", "Professional", "Bold", "Romantic"] },
    ],
  },
  "ai-ad-copy-generator": {
    toolId: "ai-ad-copy-generator",
    buttonLabel: "Generate Ad Copy",
    fields: [
      { key: "product", label: "Product or Offer", type: "text", placeholder: "e.g. AI CRM platform for agencies", required: true },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. small business owners, B2B SaaS buyers" },
      { key: "goal", label: "Campaign Goal", type: "select", options: ["Awareness", "Traffic", "Lead Generation", "Sales", "Signups"] },
      { key: "tone", label: "Tone", type: "select", options: ["Persuasive", "Direct", "Friendly", "Luxury", "Urgent"] },
    ],
  },
  "ai-facebook-ad-copy-generator": {
    toolId: "ai-facebook-ad-copy-generator",
    buttonLabel: "Generate Facebook Ad Copy",
    fields: [
      { key: "product", label: "Product or Offer", type: "text", placeholder: "e.g. productivity planner", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. busy moms, startup founders" },
      { key: "offer", label: "Offer / Hook", type: "textarea", placeholder: "Describe the key offer, discount, or benefit", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Warm", "Bold", "Benefit-led", "Playful", "Professional"] },
    ],
  },
  "ai-google-ads-copy-generator": {
    toolId: "ai-google-ads-copy-generator",
    buttonLabel: "Generate Google Ads Copy",
    fields: [
      { key: "product", label: "Product or Service", type: "text", placeholder: "e.g. local SEO audit service", required: true },
      { key: "keyword", label: "Primary Keyword", type: "text", placeholder: "e.g. SEO audit" },
      { key: "goal", label: "Goal", type: "select", options: ["Clicks", "Conversions", "Brand Awareness"] },
      { key: "tone", label: "Tone", type: "select", options: ["Direct", "Professional", "Urgent", "Benefit-led"] },
    ],
  },
  "ai-linkedin-ad-copy-generator": {
    toolId: "ai-linkedin-ad-copy-generator",
    buttonLabel: "Generate LinkedIn Ad Copy",
    fields: [
      { key: "product", label: "Product or Service", type: "text", placeholder: "e.g. B2B AI analytics platform", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. operations leaders, marketing directors" },
      { key: "benefit", label: "Key Benefit", type: "textarea", placeholder: "What outcome or value should the ad highlight?", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Professional", "Confident", "Educational", "Thoughtful"] },
    ],
  },
  "ai-sales-copy-generator": {
    toolId: "ai-sales-copy-generator",
    buttonLabel: "Generate Sales Copy",
    fields: [
      { key: "product", label: "Product or Offer", type: "text", placeholder: "e.g. online course on copywriting", required: true },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. freelancers, coaches, founders" },
      { key: "pain_point", label: "Main Pain Point", type: "textarea", placeholder: "What problem does the audience need solved?", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Persuasive", "Empathetic", "Bold", "Confident"] },
    ],
  },
  "ai-landing-page-copy-generator": {
    toolId: "ai-landing-page-copy-generator",
    buttonLabel: "Generate Landing Page Copy",
    fields: [
      { key: "product", label: "Product or Offer", type: "text", placeholder: "e.g. mortgage refinance service", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. home buyers, small business owners" },
      { key: "benefit", label: "Primary Benefit", type: "textarea", placeholder: "What is the main value proposition?", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Confident", "Trustworthy", "Inspiring", "Direct"] },
    ],
  },
  "ai-cta-generator": {
    toolId: "ai-cta-generator",
    buttonLabel: "Generate CTAs",
    fields: [
      { key: "offer", label: "Offer or Action", type: "text", placeholder: "e.g. start free trial, book a demo, download guide", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. SaaS buyers, ecommerce shoppers" },
      { key: "tone", label: "Tone", type: "select", options: ["Urgent", "Friendly", "Confident", "Professional", "Playful"] },
    ],
  },
  "ai-mission-statement": {
    toolId: "ai-mission-statement",
    buttonLabel: "Generate Mission Statement",
    fields: [
      { key: "business_name", label: "Business Name", type: "text", placeholder: "e.g. TechFlow", required: true },
      { key: "what", label: "What You Do", type: "textarea", placeholder: "e.g. We provide cloud-based project management tools for remote teams", required: true, rows: 3 },
      { key: "who", label: "Target Audience", type: "text", placeholder: "e.g. remote-first companies, startups, freelancers" },
      { key: "values", label: "Core Values", type: "text", placeholder: "e.g. innovation, collaboration, reliability" },
      { key: "tone", label: "Tone", type: "select", options: ["Inspiring", "Professional", "Action-oriented", "Values-driven"] },
    ],
  },
  "ai-vision-statement": {
    toolId: "ai-vision-statement",
    buttonLabel: "Generate Vision Statement",
    fields: [
      { key: "business_name", label: "Business Name", type: "text", placeholder: "e.g. EcoGreen", required: true },
      { key: "mission", label: "Current Mission (optional)", type: "text", placeholder: "e.g. Provide sustainable alternatives to single-use plastics" },
      { key: "future", label: "Future Vision", type: "textarea", placeholder: "Where do you want the business to be in 5-10 years?", required: true, rows: 3 },
      { key: "impact", label: "Desired Impact", type: "text", placeholder: "e.g. eliminate plastic waste, empower consumers" },
      { key: "tone", label: "Tone", type: "select", options: ["Visionary", "Ambitious", "Hopeful", "Bold"] },
    ],
  },
  "ai-company-bio": {
    toolId: "ai-company-bio",
    buttonLabel: "Generate Company Bio",
    fields: [
      { key: "company_name", label: "Company Name", type: "text", placeholder: "e.g. Stride Analytics", required: true },
      { key: "founded", label: "Founded Year / Context", type: "text", placeholder: "e.g. Founded in 2021 by..." },
      { key: "mission", label: "Mission / What You Do", type: "textarea", placeholder: "Brief summary of your business and what you offer", required: true, rows: 3 },
      { key: "achievements", label: "Key Achievements", type: "text", placeholder: "e.g. 10K+ customers, Y Combinator S22, $5M funding" },
      { key: "style", label: "Bio Style", type: "select", options: ["Formal", "Friendly", "Ambitious", "Technical"] },
    ],
  },
  "ai-brand-story": {
    toolId: "ai-brand-story",
    buttonLabel: "Generate Brand Story",
    fields: [
      { key: "company_name", label: "Company Name", type: "text", placeholder: "e.g. DesignHub", required: true },
      { key: "founder_story", label: "Founder's Background / Inspiration", type: "textarea", placeholder: "Why did you start this company? What inspired you?", required: true, rows: 4 },
      { key: "problem", label: "Problem You're Solving", type: "text", placeholder: "e.g. designers waste time on repetitive tasks" },
      { key: "solution", label: "Your Solution", type: "text", placeholder: "e.g. AI-powered design automation tools" },
      { key: "tone", label: "Tone", type: "select", options: ["Personal", "Inspiring", "Professional", "Passionate"] },
    ],
  },
};

export function getAiToolConfig(toolId: string): AiToolConfig | undefined {
  return configs[toolId];
}
