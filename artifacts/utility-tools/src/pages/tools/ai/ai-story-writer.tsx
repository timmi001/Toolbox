import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildStory(prompt: string, tone: string) {
  const cleanPrompt = prompt.trim() || 'a calm evening in a village';
  return `Story Draft\n\nPrompt: ${cleanPrompt}\n\nTone: ${tone || 'Creative'}\n\nThe sun was fading behind the hills, and the village became quiet as the day came to a close. A young student stood at the edge of the road, carrying a notebook full of dreams. As the evening breeze moved gently through the trees, the quiet seemed to promise tomorrow would be brighter.`;
}

export default function AiStoryWriter() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-story-writer')!}
      fields={[
        { key: 'prompt', label: 'Story Prompt', type: 'text', required: true, placeholder: 'e.g. A mysterious forest at sunrise' },
        { key: 'tone', label: 'Tone', type: 'select', options: ['Creative', 'Emotional', 'Inspirational', 'Mystery'] },
      ]}
      buttonLabel="Write Story"
      generate={(inputs) => buildStory(inputs.prompt ?? '', inputs.tone ?? '')}
      emptyState="Enter a prompt to generate a short story draft."
      instructions="Use this tool to create short story starters and narrative drafts."
    />
  );
}
