import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiStoryWriter() {
  return <AiToolShell tool={getToolBySlug('ai-story-writer')!} />;
}
