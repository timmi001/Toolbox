import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiLinkedInAdCopyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-linkedin-ad-copy-generator')!} />;
}
