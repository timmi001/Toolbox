import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function improveEssay(text: string, tone: string) {
  const clean = text.trim() || 'Your essay draft goes here.';
  return `Improved Essay Draft\n\nTone: ${tone || 'Professional'}\n\n${clean}\n\nSuggested improvements:\n- Strengthen the opening with a clearer thesis.\n- Improve transitions between paragraphs.\n- Replace vague words with more precise language.\n- End with a stronger conclusion.`;
}

export default function AiEssayImprover() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-essay-improver')!}
      fields={[
        { key: 'text', label: 'Essay Draft', type: 'textarea', required: true, rows: 10, placeholder: 'Paste your essay or paragraph here' },
        { key: 'tone', label: 'Target Tone', type: 'select', options: ['Professional', 'Academic', 'Confident', 'Friendly'] },
      ]}
      buttonLabel="Improve Essay"
      generate={(inputs) => improveEssay(inputs.text ?? '', inputs.tone ?? '')}
      emptyState="Paste an essay draft and get a clearer, more polished version."
      instructions="Use this tool to improve clarity, flow, and tone in existing writing."
    />
  );
}
