export type StudyAction = "notes" | "quiz" | "flashcards" | "planner" | "homework" | "tutor";

export interface StudyPromptInput {
  topic?: string;
  level?: string;
  format?: string;
  difficulty?: string;
  count?: string;
  subject?: string;
  days?: string;
  question?: string;
  answer?: string;
  role?: string;
  type?: string;
}

export function buildStudyPrompt(action: StudyAction, input: StudyPromptInput): string {
  const topic = input.topic?.trim() || "the requested topic";
  switch (action) {
    case "notes":
      return `Create comprehensive ${input.format || "Detailed Notes"} study notes for the topic: "${topic}"
Level: ${input.level || "Intermediate"}

Include:
1. Key Concepts — core ideas explained clearly
2. Important Terms — definitions in simple language
3. Main Points — organized hierarchically
4. Examples — illustrative examples for each concept
5. Summary — quick review bullet points
6. Memory Tips — mnemonics or tricks where applicable

Make the notes revision-friendly, scannable, and easy to study from.`;
    case "quiz":
      return `Generate ${input.count || "10"} ${input.difficulty || "Mixed"} difficulty quiz questions about: "${topic}"

For each question:
1. Question text
2. Four multiple choice options (A, B, C, D)
3. Correct answer marked with ✓
4. Brief explanation of why it is correct

Make the questions varied and practical for study revision.`;
    case "flashcards":
      return `Create ${input.count || "15"} flashcards for studying: "${topic}"

Format each flashcard as:
FRONT: [Question or term]
BACK: [Answer or definition]

Keep the answers concise and focused on the most important concepts.`;
    case "planner":
      return `Create a practical weekly revision plan for "${topic}".
Target duration: ${input.days || "7"} days.
Subject focus: ${input.subject || "General study"}

Include daily study blocks, priorities, and simple milestones for steady progress.`;
    case "homework":
      return `Help with ${input.subject || "this homework topic"}: "${topic}"

Break the task into clear steps, explain the concept simply, and provide a worked example that makes the solution easier to follow.`;
    case "tutor":
      return `Act as a patient study tutor for "${topic}".
Explain the concept clearly, answer the question directly, and provide a step-by-step breakdown that a learner can follow easily.

Question: ${input.question || "Please explain the topic clearly."}
Answer: ${input.answer || ""}`;
    default:
      return `Help the learner study "${topic}" in a clear and structured way.`;
  }
}
