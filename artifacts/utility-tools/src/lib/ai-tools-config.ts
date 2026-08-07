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
  "ai-essay-generator": {
    toolId: "ai-essay-generator",
    buttonLabel: "Generate Essay",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "e.g. The importance of education", required: true },
      { key: "style", label: "Style", type: "select", options: ["Professional", "Academic", "Simple", "Persuasive"] },
    ],
  },
  "ai-story-writer": {
    toolId: "ai-story-writer",
    buttonLabel: "Write Story",
    fields: [
      { key: "prompt", label: "Story Prompt", type: "text", placeholder: "e.g. A mysterious forest at sunrise", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Creative", "Emotional", "Inspirational", "Mystery"] },
    ],
  },
  "ai-book-outline-generator": {
    toolId: "ai-book-outline-generator",
    buttonLabel: "Generate Outline",
    fields: [
      { key: "topic", label: "Book Topic", type: "text", placeholder: "e.g. Leadership for young professionals", required: true },
    ],
  },
  "ai-chapter-generator": {
    toolId: "ai-chapter-generator",
    buttonLabel: "Draft Chapter",
    fields: [
      { key: "topic", label: "Book Topic", type: "text", placeholder: "e.g. Personal finance basics", required: true },
      { key: "chapter", label: "Chapter Title", type: "text", placeholder: "e.g. Building good habits" },
    ],
  },
  "ai-speech-writer": {
    toolId: "ai-speech-writer",
    buttonLabel: "Write Speech",
    fields: [
      { key: "topic", label: "Speech Topic", type: "text", placeholder: "e.g. The value of discipline", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. Students, team, conference" },
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
  "ai-interview-practice": {
    toolId: "ai-interview-practice",
    buttonLabel: "Get Feedback",
    fields: [
      { key: "role", label: "Job Role / Position", type: "text", placeholder: "e.g. Frontend Engineer, Product Manager", required: true },
      { key: "question", label: "Interview Question", type: "textarea", placeholder: "e.g. Tell me about a time you handled a difficult stakeholder.", required: true, rows: 3 },
      { key: "answer", label: "Your Answer", type: "textarea", placeholder: "Type or paste the answer you'd give in the interview...", required: true, rows: 8 },
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
  "ai-event-assistant": {
    toolId: "ai-event-assistant",
    buttonLabel: "Plan Event",
    fields: [
      { key: "event_type", label: "Event Type", type: "select", options: ["Birthday", "Wedding", "Corporate Launch", "Baby Shower", "Graduation", "Community Gathering", "Other"], required: true },
      { key: "theme", label: "Theme / Mood", type: "text", placeholder: "e.g. elegant, playful, boho, minimal", required: true },
      { key: "guest_count", label: "Estimated Guests", type: "text", placeholder: "e.g. 40 guests" },
      { key: "budget", label: "Budget Range", type: "text", placeholder: "e.g. $2,000 - $5,000" },
      { key: "details", label: "Extra Details", type: "textarea", placeholder: "Add the vibe, venue notes, food ideas, or anything else that matters...", rows: 4 } ,
    ],
  },
  "ai-event-itinerary": {
    toolId: "ai-event-itinerary",
    buttonLabel: "Build Itinerary",
    fields: [
      { key: "event_name", label: "Event Name", type: "text", placeholder: "e.g. Summer Launch Party", required: true },
      { key: "duration", label: "Event Duration", type: "text", placeholder: "e.g. 4 hours" },
      { key: "flow", label: "Flow / Agenda Notes", type: "textarea", placeholder: "Share your desired sequence, arrival time, speeches, dinner, games, or any key moments...", required: true, rows: 5 },
      { key: "tone", label: "Tone", type: "select", options: ["Elegant", "Relaxed", "Energetic", "Formal", "Playful"] },
    ],
  },
  "ai-event-checklist": {
    toolId: "ai-event-checklist",
    buttonLabel: "Generate Checklist",
    fields: [
      { key: "event_name", label: "Event Name", type: "text", placeholder: "e.g. Wedding Reception", required: true },
      { key: "timeline", label: "Planning Timeline", type: "select", options: ["1 month", "2 months", "3 months", "6 months", "Flexible"], required: true },
      { key: "details", label: "Specific Needs", type: "textarea", placeholder: "Mention vendors, decor, logistics, food, transport, or special requests...", rows: 4 } ,
    ],
  },
  "ai-event-invitation": {
    toolId: "ai-event-invitation",
    buttonLabel: "Write Invitation",
    fields: [
      { key: "event_name", label: "Event Name", type: "text", placeholder: "e.g. Birthday Brunch", required: true },
      { key: "audience", label: "Audience", type: "text", placeholder: "e.g. close friends, coworkers, family" },
      { key: "tone", label: "Tone", type: "select", options: ["Warm", "Elegant", "Playful", "Formal", "Casual"], required: true },
      { key: "details", label: "Event Details", type: "textarea", placeholder: "Add date, venue, dress code, RSVP notes, or any extra context...", rows: 4 },
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
  "ai-resume-summary": {
    toolId: "ai-resume-summary",
    buttonLabel: "Generate Summary",
    fields: [
      { key: "target_role", label: "Target Job Title", type: "text", placeholder: "e.g. Senior Software Engineer", required: true },
      { key: "experience", label: "Background / Experience", type: "textarea", placeholder: "Briefly describe your experience, key skills, and achievements...", required: true, rows: 4 },
      { key: "skills", label: "Key Skills", type: "text", placeholder: "e.g. React, Node.js, Leadership" },
    ],
  },
  "ai-resume-bullet-points": {
    toolId: "ai-resume-bullet-points",
    buttonLabel: "Generate Bullet Points",
    fields: [
      { key: "role", label: "Job Title", type: "text", placeholder: "e.g. Marketing Manager", required: true },
      { key: "responsibilities", label: "Responsibilities / Tasks", type: "textarea", placeholder: "Describe your day-to-day tasks and responsibilities...", required: true, rows: 5 },
      { key: "count", label: "Number of Bullet Points", type: "select", options: ["3","5","8"] },
    ],
  },
  "ai-linkedin-headline": {
    toolId: "ai-linkedin-headline",
    buttonLabel: "Generate Headline",
    fields: [
      { key: "role", label: "Current Role / Title", type: "text", placeholder: "e.g. Product Designer at Acme", required: true },
      { key: "skills", label: "Key Skills / Specialties", type: "text", placeholder: "e.g. UX research, design systems, Figma" },
      { key: "industry", label: "Industry", type: "text", placeholder: "e.g. fintech, healthcare, SaaS" },
    ],
  },
  "ai-professional-bio": {
    toolId: "ai-professional-bio",
    buttonLabel: "Generate Bio",
    fields: [
      { key: "name", label: "Your Name", type: "text", placeholder: "e.g. Jane Doe", required: true },
      { key: "role", label: "Role / Title", type: "text", placeholder: "e.g. Senior Data Scientist", required: true },
      { key: "background", label: "Background / Highlights", type: "textarea", placeholder: "Key experience, achievements, and interests...", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Professional","Friendly","Confident","Creative"] },
    ],
  },
  "ai-twitter-post": {
    toolId: "ai-twitter-post",
    buttonLabel: "Generate Post",
    fields: [
      { key: "topic", label: "Topic / Message", type: "text", placeholder: "e.g. launching our new AI feature today", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Witty","Informative","Bold","Casual","Professional"] },
    ],
  },
  "ai-linkedin-post": {
    toolId: "ai-linkedin-post",
    buttonLabel: "Generate Post",
    fields: [
      { key: "topic", label: "Topic / Message", type: "text", placeholder: "e.g. lessons learned from scaling a remote team", required: true },
      { key: "goal", label: "Goal", type: "select", options: ["Thought Leadership","Career Update","Company News","Engagement"] },
      { key: "tone", label: "Tone", type: "select", options: ["Professional","Personal","Inspiring"] },
    ],
  },
  "ai-tiktok-caption": {
    toolId: "ai-tiktok-caption",
    buttonLabel: "Generate Caption",
    fields: [
      { key: "topic", label: "Video Topic / Description", type: "text", placeholder: "e.g. day in my life as a software engineer", required: true },
      { key: "tone", label: "Tone", type: "select", options: ["Fun","Trendy","Relatable","Bold"] },
    ],
  },
  "ai-youtube-description": {
    toolId: "ai-youtube-description",
    buttonLabel: "Generate Description",
    fields: [
      { key: "title", label: "Video Title", type: "text", placeholder: "e.g. How I Built a SaaS App in 30 Days", required: true },
      { key: "topic", label: "Video Summary", type: "textarea", placeholder: "What is the video about? Key points covered...", required: true, rows: 4 },
      { key: "keywords", label: "Target Keywords", type: "text", placeholder: "e.g. saas, indie hacker, coding" },
    ],
  },
  "ai-blog-title": {
    toolId: "ai-blog-title",
    buttonLabel: "Generate Titles",
    fields: [
      { key: "topic", label: "Blog Topic", type: "text", placeholder: "e.g. productivity tips for remote workers", required: true },
      { key: "keywords", label: "Target Keywords", type: "text", placeholder: "e.g. remote work, productivity" },
    ],
  },
  "ai-blog-outline": {
    toolId: "ai-blog-outline",
    buttonLabel: "Generate Outline",
    fields: [
      { key: "topic", label: "Blog Topic", type: "text", placeholder: "e.g. beginner's guide to investing in index funds", required: true },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. young professionals, beginners" },
    ],
  },
  "ai-blog-introduction": {
    toolId: "ai-blog-introduction",
    buttonLabel: "Generate Introduction",
    fields: [
      { key: "topic", label: "Blog Topic", type: "text", placeholder: "e.g. why most startups fail in year one", required: true },
      { key: "hook", label: "Hook Style", type: "select", options: ["Question","Statistic","Story","Bold Statement"] },
    ],
  },
  "ai-blog-conclusion": {
    toolId: "ai-blog-conclusion",
    buttonLabel: "Generate Conclusion",
    fields: [
      { key: "topic", label: "Blog Topic", type: "text", placeholder: "e.g. how to build a personal budget", required: true },
      { key: "cta", label: "Call to Action (optional)", type: "text", placeholder: "e.g. subscribe to our newsletter, book a free call" },
    ],
  },
  "ai-article-rewriter": {
    toolId: "ai-article-rewriter",
    buttonLabel: "Rewrite Article",
    fields: [
      { key: "text", label: "Article to Rewrite", type: "textarea", placeholder: "Paste the full article text here...", required: true, rows: 10 },
    ],
  },
  "ai-paragraph-rewriter": {
    toolId: "ai-paragraph-rewriter",
    buttonLabel: "Rewrite Paragraph",
    fields: [
      { key: "text", label: "Paragraph to Rewrite", type: "textarea", placeholder: "Paste your paragraph here...", required: true, rows: 5 },
      { key: "style", label: "Style", type: "select", options: ["Standard","Formal","Casual","Simpler"] },
    ],
  },
  "ai-sentence-rewriter": {
    toolId: "ai-sentence-rewriter",
    buttonLabel: "Rewrite Sentence",
    fields: [
      { key: "text", label: "Sentence(s) to Rewrite", type: "textarea", placeholder: "Enter one or more sentences...", required: true, rows: 3 },
      { key: "style", label: "Style", type: "select", options: ["Standard","Formal","Casual","Concise"] },
    ],
  },
  "ai-cold-email": {
    toolId: "ai-cold-email",
    buttonLabel: "Generate Email",
    fields: [
      { key: "recipient", label: "Recipient (name/role)", type: "text", placeholder: "e.g. Head of Marketing" },
      { key: "offer", label: "What You're Offering", type: "textarea", placeholder: "Describe your product/service and the value it provides...", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Direct","Friendly","Professional"] },
    ],
  },
  "ai-sales-email": {
    toolId: "ai-sales-email",
    buttonLabel: "Generate Email",
    fields: [
      { key: "product", label: "Product / Offer", type: "text", placeholder: "e.g. annual plan upgrade with 20% discount", required: true },
      { key: "audience", label: "Target Audience", type: "text", placeholder: "e.g. existing free-tier users" },
      { key: "tone", label: "Tone", type: "select", options: ["Persuasive","Friendly","Urgent"] },
    ],
  },
  "ai-followup-email": {
    toolId: "ai-followup-email",
    buttonLabel: "Generate Email",
    fields: [
      { key: "context", label: "Context / Situation", type: "textarea", placeholder: "e.g. following up after an interview last week, no response to a proposal sent 5 days ago...", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Polite","Direct","Warm"] },
    ],
  },
  "ai-support-reply": {
    toolId: "ai-support-reply",
    buttonLabel: "Generate Reply",
    fields: [
      { key: "issue", label: "Customer's Issue / Message", type: "textarea", placeholder: "Paste or describe the customer's complaint or question...", required: true, rows: 4 },
      { key: "tone", label: "Tone", type: "select", options: ["Empathetic","Professional","Friendly"] },
    ],
  },
  "ai-thank-you-email": {
    toolId: "ai-thank-you-email",
    buttonLabel: "Generate Email",
    fields: [
      { key: "occasion", label: "Occasion", type: "text", placeholder: "e.g. job interview, business meeting, customer purchase", required: true },
      { key: "recipient", label: "Recipient (name/role)", type: "text", placeholder: "e.g. Sarah, Hiring Manager" },
      { key: "details", label: "Additional Details (optional)", type: "textarea", placeholder: "Anything specific to mention...", rows: 3 },
    ],
  },
  "ai-text-improver": {
    toolId: "ai-text-improver",
    buttonLabel: "Improve Text",
    fields: [
      { key: "text", label: "Text to Improve", type: "textarea", placeholder: "Paste your text here...", required: true, rows: 8 },
    ],
  },
  "ai-tone-changer": {
    toolId: "ai-tone-changer",
    buttonLabel: "Change Tone",
    fields: [
      { key: "text", label: "Text", type: "textarea", placeholder: "Paste your text here...", required: true, rows: 6 },
      { key: "tone", label: "Target Tone", type: "select", options: ["Formal","Friendly","Confident","Professional","Casual","Persuasive"], required: true },
    ],
  },
  "ai-expand-text": {
    toolId: "ai-expand-text",
    buttonLabel: "Expand Text",
    fields: [
      { key: "text", label: "Text to Expand", type: "textarea", placeholder: "Paste the text you want to expand...", required: true, rows: 5 },
    ],
  },
  "ai-shorten-text": {
    toolId: "ai-shorten-text",
    buttonLabel: "Shorten Text",
    fields: [
      { key: "text", label: "Text to Shorten", type: "textarea", placeholder: "Paste the text you want to shorten...", required: true, rows: 6 },
    ],
  },
  "ai-proofreader": {
    toolId: "ai-proofreader",
    buttonLabel: "Proofread Text",
    fields: [
      { key: "text", label: "Text to Proofread", type: "textarea", placeholder: "Paste your text here for a full proofreading pass...", required: true, rows: 8 },
    ],
  },
  "ai-ghostwriting": {
    toolId: "ai-ghostwriting",
    buttonLabel: "Generate Content",
    fields: [
      { key: "topic", label: "Topic or Brief", type: "textarea", placeholder: "Describe the article, speech, or piece you need ghostwritten...", required: true, rows: 5 },
      { key: "type", label: "Content Type", type: "select", options: ["Blog Article", "Speech", "Personal Essay", "LinkedIn Post", "Social Bio", "Email Draft"] },
      { key: "tone", label: "Voice & Tone", type: "select", options: ["Professional", "Conversational", "Inspiring", "Academic", "Casual"] },
    ],
  },
  "ai-ticket-finder": {
    toolId: "ai-ticket-finder",
    buttonLabel: "Find Tickets",
    fields: [
      { key: "query", label: "Event or Artist", type: "text", placeholder: "e.g. Taylor Swift, comedy night, local festival", required: true },
      { key: "location", label: "City or Region", type: "text", placeholder: "e.g. London, New York" },
      { key: "budget", label: "Budget", type: "text", placeholder: "e.g. under $150" },
    ],
  },
  "ai-event-search": {
    toolId: "ai-event-search",
    buttonLabel: "Search Events",
    fields: [
      { key: "query", label: "What are you looking for?", type: "text", placeholder: "e.g. rooftop party, jazz night, family event", required: true },
      { key: "location", label: "Location", type: "text", placeholder: "e.g. Chicago" },
      { key: "date", label: "Preferred Date", type: "text", placeholder: "e.g. this weekend" },
    ],
  },
  "ai-price-comparison": {
    toolId: "ai-price-comparison",
    buttonLabel: "Compare Prices",
    fields: [
      { key: "event", label: "Event Name", type: "text", placeholder: "e.g. NBA game", required: true },
      { key: "location", label: "Venue or City", type: "text", placeholder: "e.g. Madison Square Garden" },
      { key: "budget", label: "Budget", type: "text", placeholder: "e.g. $100-$250" },
    ],
  },
  "ai-price-tracker": {
    toolId: "ai-price-tracker",
    buttonLabel: "Track Prices",
    fields: [
      { key: "event", label: "Event Name", type: "text", placeholder: "e.g. festival pass", required: true },
      { key: "budget", label: "Budget Target", type: "text", placeholder: "e.g. under $80" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Mention dates, seat preferences, or urgency...", rows: 4 }],
  },
  "ai-ticket-alerts": {
    toolId: "ai-ticket-alerts",
    buttonLabel: "Create Alerts",
    fields: [
      { key: "event", label: "Event or Artist", type: "text", placeholder: "e.g. football match", required: true },
      { key: "location", label: "Location", type: "text", placeholder: "e.g. Los Angeles" },
      { key: "frequency", label: "Alert Frequency", type: "select", options: ["Daily", "Weekly", "When prices drop"] },
    ],
  },
  "ai-artist-tour-finder": {
    toolId: "ai-artist-tour-finder",
    buttonLabel: "Find Tour Dates",
    fields: [
      { key: "artist", label: "Artist or Band", type: "text", placeholder: "e.g. Dua Lipa", required: true },
      { key: "location", label: "Preferred City", type: "text", placeholder: "e.g. Seattle" },
      { key: "date", label: "Preferred Timeframe", type: "text", placeholder: "e.g. next 3 months" },
    ],
  },
  "ai-sports-tickets": {
    toolId: "ai-sports-tickets",
    buttonLabel: "Find Sports Tickets",
    fields: [
      { key: "sport", label: "Sport or Team", type: "text", placeholder: "e.g. football, Lakers", required: true },
      { key: "location", label: "City or Venue", type: "text", placeholder: "e.g. Miami" },
      { key: "date", label: "Date or Upcoming Match", type: "text", placeholder: "e.g. this month" },
    ],
  },
  "ai-festival-finder": {
    toolId: "ai-festival-finder",
    buttonLabel: "Find Festivals",
    fields: [
      { key: "genre", label: "Genre or Theme", type: "text", placeholder: "e.g. EDM, food, film", required: true },
      { key: "location", label: "Location", type: "text", placeholder: "e.g. Austin" },
      { key: "date", label: "Timeframe", type: "text", placeholder: "e.g. summer" },
    ],
  },
  "ai-theatre-shows": {
    toolId: "ai-theatre-shows",
    buttonLabel: "Find Shows",
    fields: [
      { key: "genre", label: "Type of Show", type: "text", placeholder: "e.g. comedy, musical, drama", required: true },
      { key: "location", label: "City", type: "text", placeholder: "e.g. Toronto" },
      { key: "budget", label: "Budget", type: "text", placeholder: "e.g. under $100" },
    ],
  },
  "ai-nearby-events": {
    toolId: "ai-nearby-events",
    buttonLabel: "Find Nearby Events",
    fields: [
      { key: "location", label: "Your Location", type: "text", placeholder: "e.g. downtown Seattle", required: true },
      { key: "interest", label: "Interests", type: "text", placeholder: "e.g. live music, food, nightlife" },
      { key: "date", label: "Date Range", type: "text", placeholder: "e.g. this weekend" },
    ],
  },
  "ai-seat-finder": {
    toolId: "ai-seat-finder",
    buttonLabel: "Find Best Seats",
    fields: [
      { key: "event", label: "Event or Venue", type: "text", placeholder: "e.g. concert at Red Rocks", required: true },
      { key: "preference", label: "Seat Preference", type: "text", placeholder: "e.g. close to stage, under $80" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Mention accessibility or view preferences...", rows: 4 }],
  },
  "ai-event-trip-planner": {
    toolId: "ai-event-trip-planner",
    buttonLabel: "Plan the Trip",
    fields: [
      { key: "event", label: "Event Name", type: "text", placeholder: "e.g. weekend festival", required: true },
      { key: "location", label: "Destination", type: "text", placeholder: "e.g. Austin" },
      { key: "budget", label: "Trip Budget", type: "text", placeholder: "e.g. $500" },
    ],
  },
  "ai-practice-questions": {
    toolId: "ai-practice-questions",
    buttonLabel: "Generate Practice Questions",
    fields: [
      { key: "topic", label: "Topic or Subject", type: "text", placeholder: "e.g. Algebra, World History, Biology", required: true },
      { key: "exam", label: "Exam or Course", type: "text", placeholder: "e.g. GCSE, SAT, Medical School" },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Mixed"] },
      { key: "count", label: "Number of Questions", type: "select", options: ["5", "10", "15", "20"] },
    ],
  },
  "ai-mock-exam-generator": {
    toolId: "ai-mock-exam-generator",
    buttonLabel: "Generate Mock Exam",
    fields: [
      { key: "topic", label: "Subject or Topic", type: "text", placeholder: "e.g. Physics, Economics, JavaScript", required: true },
      { key: "duration", label: "Exam Duration", type: "text", placeholder: "e.g. 60 minutes" },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Hard", "Mixed"] },
      { key: "count", label: "Question Count", type: "select", options: ["10", "15", "20", "25"] },
    ],
  },
  "ai-tutor-chat": {
    toolId: "ai-tutor-chat",
    buttonLabel: "Explain This Topic",
    fields: [
      { key: "topic", label: "Topic to Learn", type: "text", placeholder: "e.g. Photosynthesis, Calculus derivatives", required: true },
      { key: "level", label: "Learner Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
      { key: "question", label: "What do you want help with?", type: "textarea", placeholder: "Ask for examples, step-by-step help, or a quick explanation...", required: true, rows: 4 },
    ],
  },
  "ai-flashcard-generator": {
    toolId: "ai-flashcard-generator",
    buttonLabel: "Generate Flashcards",
    fields: [
      { key: "topic", label: "Topic or Chapter", type: "text", placeholder: "e.g. Cell structure, World War II", required: true },
      { key: "level", label: "Study Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
      { key: "count", label: "Number of Flashcards", type: "select", options: ["10", "15", "20", "25"] },
    ],
  },
  "ai-study-notes-generator": {
    toolId: "ai-study-notes-generator",
    buttonLabel: "Generate Study Notes",
    fields: [
      { key: "topic", label: "Topic or Subject", type: "text", placeholder: "e.g. Organic Chemistry, Machine Learning", required: true },
      { key: "level", label: "Learner Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
      { key: "format", label: "Notes Style", type: "select", options: ["Detailed Notes", "Revision Notes", "Formula Sheet", "Exam Summary"] },
    ],
  },
  "ai-weak-topic-analyzer": {
    toolId: "ai-weak-topic-analyzer",
    buttonLabel: "Analyze Weak Topics",
    fields: [
      { key: "topic", label: "Subject / Topic Area", type: "text", placeholder: "e.g. Mathematics, Biology, Programming", required: true },
      { key: "details", label: "Performance Notes", type: "textarea", placeholder: "Share past mistakes, low scores, or recurring problem areas...", required: true, rows: 5 },
    ],
  },
  "ai-study-planner": {
    toolId: "ai-study-planner",
    buttonLabel: "Create Study Plan",
    fields: [
      { key: "topic", label: "Exam or Goal", type: "text", placeholder: "e.g. IELTS, CFA Level 1, Final exam", required: true },
      { key: "date", label: "Target Date", type: "text", placeholder: "e.g. 4 weeks from now" },
      { key: "hours", label: "Daily Study Hours", type: "text", placeholder: "e.g. 2 hours" },
    ],
  },
  "ai-previous-question-generator": {
    toolId: "ai-previous-question-generator",
    buttonLabel: "Generate Exam-Style Questions",
    fields: [
      { key: "topic", label: "Subject or Topic", type: "text", placeholder: "e.g. Statistics, Literature, React", required: true },
      { key: "exam", label: "Exam / Board", type: "text", placeholder: "e.g. JAMB, NEET, UPSC" },
      { key: "count", label: "Number of Questions", type: "select", options: ["5", "10", "15"] },
    ],
  },
  "ai-performance-analytics": {
    toolId: "ai-performance-analytics",
    buttonLabel: "Analyze Performance",
    fields: [
      { key: "topic", label: "Subject or Exam", type: "text", placeholder: "e.g. Biology, Mock Exam 1", required: true },
      { key: "details", label: "Scores / Notes", type: "textarea", placeholder: "Paste your scores, accuracy, mistakes, and study history...", required: true, rows: 5 },
    ],
  },
  "ai-pdf-practice-papers": {
    toolId: "ai-pdf-practice-papers",
    buttonLabel: "Create Practice Papers",
    fields: [
      { key: "topic", label: "Subject or Topic", type: "text", placeholder: "e.g. English Literature, Accounting", required: true },
      { key: "level", label: "Level / Class", type: "text", placeholder: "e.g. Grade 10, Undergraduate" },
      { key: "count", label: "Number of Papers", type: "select", options: ["1", "2", "3"] },
    ],
  },
  "ai-daily-practice": {
    toolId: "ai-daily-practice",
    buttonLabel: "Generate Daily Practice",
    fields: [
      { key: "topic", label: "Subject or Topic", type: "text", placeholder: "e.g. Vocabulary, Calculus", required: true },
      { key: "goal", label: "Daily Goal", type: "text", placeholder: "e.g. 20 minutes, 1 chapter" },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Challenging"] },
    ],
  },
  "ai-jamb-cbt-practice": {
    toolId: "ai-jamb-cbt-practice",
    buttonLabel: "Generate Questions",
    fields: [
      { key: "subject", label: "Subject", type: "text", placeholder: "e.g. English, Mathematics, Physics, Chemistry, Biology", required: true },
    ],
  },
};

export function getAiToolConfig(toolId: string): AiToolConfig | undefined {
  return configs[toolId];
}
