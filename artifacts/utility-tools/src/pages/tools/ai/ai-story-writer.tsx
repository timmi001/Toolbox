import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

export default function AiStoryWriter() {
  return <AiToolShell tool={getToolBySlug('ai-story-writer')!} />;
}
