import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildPractice(subject: string) {
  const clean = subject.trim() || 'English';
  return `JAMB CBT Practice Prompt\n\nSubject: ${clean}\n\nSample Question:\nWhat is the main idea of the passage?\n\nOptions:\nA. The passage explains a process\nB. The passage compares two ideas\nC. The passage describes a setting\nD. The passage gives a warning\n\nCorrect Answer: A\n\nTip: Read the question carefully and eliminate answers that are too broad or unrelated.`;
}

export default function AiJambCbtPractice() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-jamb-cbt-practice')!}
      fields={[
        { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'e.g. English, Mathematics, Biology' },
      ]}
      buttonLabel="Generate Practice Question"
      generate={(inputs) => buildPractice(inputs.subject ?? '')}
      emptyState="Enter a subject to generate a simple JAMB-style practice question."
      instructions="Use this tool to create a quick JAMB CBT-style practice prompt for revision."
    />
  );
}
