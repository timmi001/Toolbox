import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildBookOutline(topic: string) {
  const cleanTopic = topic.trim() || 'your book idea';
  return `Book Outline for ${cleanTopic}\n\nPart 1: Introduction\n- Introduce the main theme and the audience.\n\nPart 2: Core Chapters\n- Chapter 1: Main problem or idea\n- Chapter 2: Supporting arguments and examples\n- Chapter 3: Key turning point or insight\n\nPart 3: Conclusion\n- Summarize the key message\n- End with a strong takeaway or call to action`;
}

export default function AiBookOutlineGenerator() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-book-outline-generator')!}
      fields={[
        { key: 'topic', label: 'Book Topic', type: 'text', required: true, placeholder: 'e.g. Leadership for young professionals' },
      ]}
      buttonLabel="Generate Outline"
      generate={(inputs) => buildBookOutline(inputs.topic ?? '')}
      emptyState="Enter a book topic to generate a simple outline."
      instructions="Use this tool to sketch a basic book structure quickly."
    />
  );
}
