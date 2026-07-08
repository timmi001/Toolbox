import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBrandStory() {
  return <AiToolShell tool={getToolBySlug('ai-brand-story')!} />;
}
