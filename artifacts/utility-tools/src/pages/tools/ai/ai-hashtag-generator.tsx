import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiHashtagGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-hashtag-generator')!} />;
}
