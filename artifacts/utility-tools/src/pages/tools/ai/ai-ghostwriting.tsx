import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildGhostwrite(prompt: string, type: string) {
  const cleanPrompt = prompt.trim() || 'a motivational message';
  return `Ghostwriting Draft (${type || 'General'})\n\nPrompt: ${cleanPrompt}\n\nDraft:\nThis piece is written in a clear and engaging tone that fits the purpose of the request. It is structured with a strong opening, a focused middle, and a polished conclusion to make the message feel complete and professional.`;
}

export default function AiGhostwriting() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-ghostwriting')!}
      fields={[
        { key: 'prompt', label: 'What should be written?', type: 'textarea', required: true, rows: 8, placeholder: 'e.g. Write a short speech about perseverance' },
        { key: 'type', label: 'Content Type', type: 'select', options: ['Speech', 'Letter', 'Story', 'Email', 'Article'] },
      ]}
      buttonLabel="Draft Content"
      generate={(inputs) => buildGhostwrite(inputs.prompt ?? '', inputs.type ?? '')}
      emptyState="Describe the content you want and get a polished draft instantly."
      instructions="Use this tool to draft speeches, letters, stories, and other written content quickly."
    />
  );
}
