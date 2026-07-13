import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiShortenText() {
  return <AiToolShell tool={getToolBySlug('ai-shorten-text')!} />;
}
