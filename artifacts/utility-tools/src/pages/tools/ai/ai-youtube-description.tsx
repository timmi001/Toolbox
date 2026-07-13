import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiYoutubeDescription() {
  return <AiToolShell tool={getToolBySlug('ai-youtube-description')!} />;
}
