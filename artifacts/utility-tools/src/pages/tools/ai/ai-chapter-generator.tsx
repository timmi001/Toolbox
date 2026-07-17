import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildChapter(topic: string, chapter: string) {
  const cleanTopic = topic.trim() || 'your topic';
  const cleanChapter = chapter.trim() || 'Introduction';
  return `Chapter Draft\n\nTopic: ${cleanTopic}\nChapter Title: ${cleanChapter}\n\nThis chapter introduces the main idea in a clear and engaging way. It explains the purpose, highlights the key point, and provides a strong transition into the next section. The writing remains focused and easy to follow.`;
}

export default function AiChapterGenerator() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-chapter-generator')!}
      fields={[
        { key: 'topic', label: 'Book Topic', type: 'text', required: true, placeholder: 'e.g. Personal finance basics' },
        { key: 'chapter', label: 'Chapter Title', type: 'text', placeholder: 'e.g. Building good habits' },
      ]}
      buttonLabel="Draft Chapter"
      generate={(inputs) => buildChapter(inputs.topic ?? '', inputs.chapter ?? '')}
      emptyState="Enter a topic and chapter title to draft a chapter section."
      instructions="Use this tool to generate a chapter starter for a book or long-form content."
    />
  );
}
