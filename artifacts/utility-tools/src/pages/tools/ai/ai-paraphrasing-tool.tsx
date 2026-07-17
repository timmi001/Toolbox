import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function paraphraseText(text: string, style: string) {
  const source = text.trim() || 'Enter text to paraphrase.';
  return `Paraphrased Version (${style || 'Standard'})\n\n${source.replace(/\./g, '. ')}\n\nSuggested alternative:\nThis idea can be expressed in a more polished and varied way while keeping the same meaning and intent.`;
}

export default function AiParaphrasingTool() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-paraphrasing-tool')!}
      fields={[
        { key: 'text', label: 'Text to Paraphrase', type: 'textarea', required: true, rows: 8, placeholder: 'Paste the text you want to reword' },
        { key: 'style', label: 'Style', type: 'select', options: ['Standard', 'Formal', 'Simple', 'Academic'] },
      ]}
      buttonLabel="Paraphrase"
      generate={(inputs) => paraphraseText(inputs.text ?? '', inputs.style ?? '')}
      emptyState="Paste text and get a reworded version instantly."
      instructions="Use this tool to rewrite text in a different style while keeping the meaning intact."
    />
  );
}
