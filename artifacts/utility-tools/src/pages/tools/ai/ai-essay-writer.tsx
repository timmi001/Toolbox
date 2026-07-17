import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildEssay(input: string, tone: string, length: string) {
  const topic = input.trim() || 'your topic';
  const intro = `Writing about ${topic} requires a clear introduction, focused body paragraphs, and a concise conclusion.`;
  const body = `Begin by introducing the main idea and explaining why it matters. Then expand with relevant points, examples, and evidence. Keep the writing logical and easy to follow.`;
  const conclusion = `End by summarizing the central argument and reinforcing the main takeaway.`;
  return `Essay Draft on ${topic}\n\n${intro}\n\n${body}\n\n${conclusion}\n\nTone: ${tone || 'Professional'}\nLength: ${length || 'Medium'}`;
}

export default function AiEssayWriter() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-essay-writer')!}
      fields={[
        { key: 'topic', label: 'Essay Topic', type: 'text', required: true, placeholder: 'e.g. The impact of technology on education' },
        { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Academic', 'Persuasive', 'Friendly'] },
        { key: 'length', label: 'Length', type: 'select', options: ['Short', 'Medium', 'Detailed'] },
      ]}
      buttonLabel="Write Essay"
      generate={(inputs) => buildEssay(inputs.topic ?? '', inputs.tone ?? '', inputs.length ?? '')}
      emptyState="Enter a topic and generate a ready-to-edit essay draft."
      instructions="Use this tool to draft an essay structure and content on any topic."
    />
  );
}
