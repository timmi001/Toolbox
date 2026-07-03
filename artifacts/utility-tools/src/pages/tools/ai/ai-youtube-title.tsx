import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiYoutubeTitle() {
  return <AiToolShell tool={getToolBySlug('ai-youtube-title')!} />;
}
