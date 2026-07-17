import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildEssayGenerator(topic: string, style: string) {
  const cleanTopic = topic.trim() || 'a meaningful topic';
  return `Essay Generator\n\nTopic: ${cleanTopic}\n\nStyle: ${style || 'Professional'}\n\nIntroduction:\nThis essay explores the importance of ${cleanTopic} and why it matters in everyday life.\n\nBody:\nIt examines the main ideas, practical value, and the broader impact on readers or society.\n\nConclusion:\nIn summary, ${cleanTopic} remains relevant because it encourages deeper understanding and meaningful reflection.`;
}

export default function AiEssayGenerator() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-essay-generator')!}
      fields={[
        { key: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. The importance of education' },
        { key: 'style', label: 'Style', type: 'select', options: ['Professional', 'Academic', 'Simple', 'Persuasive'] },
      ]}
      buttonLabel="Generate Essay"
      generate={(inputs) => buildEssayGenerator(inputs.topic ?? '', inputs.style ?? '')}
      emptyState="Enter a topic and generate a polished essay outline and draft."
      instructions="Use this tool to draft an essay on almost any topic quickly."
    />
  );
}
