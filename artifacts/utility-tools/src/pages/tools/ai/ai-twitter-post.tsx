import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTwitterPost() {
  return <AiToolShell tool={getToolBySlug('ai-twitter-post')!} />;
}
