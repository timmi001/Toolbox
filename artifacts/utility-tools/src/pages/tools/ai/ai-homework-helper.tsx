import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildHomeworkHelp(input: string, subject: string) {
  const topic = input.trim();
  return `Homework Help Plan for ${subject || 'your subject'}\n\nTopic: ${topic || 'Your topic'}\n\n1. What to understand\n- Define the key idea in simple language.\n- Identify the main concept, process, or formula involved.\n- Note any important terms and definitions.\n\n2. Step-by-step approach\n- Break the problem into smaller parts.\n- Solve one part at a time and show your reasoning.\n- Check your answer against the question requirements.\n\n3. Study tip\n- Explain the answer out loud as if teaching someone else.\n- Review the main formula or principle before submitting.\n\n4. Example response\nA clear, concise explanation for this topic should include the main idea, supporting details, and a short conclusion. Keep your writing focused and avoid filler.`;
}

export default function AiHomeworkHelper() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-homework-helper')!}
      fields={[
        { key: 'topic', label: 'Homework Topic or Question', type: 'textarea', required: true, rows: 6, placeholder: 'e.g. Explain photosynthesis in simple terms' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Biology' },
      ]}
      buttonLabel="Generate Help Plan"
      generate={(inputs) => buildHomeworkHelp(inputs.topic ?? '', inputs.subject ?? '')}
      emptyState="Enter a homework question and subject to get a clear study plan instantly."
      instructions="Use this tool to turn a homework question into a simple step-by-step study plan."
    />
  );
}
