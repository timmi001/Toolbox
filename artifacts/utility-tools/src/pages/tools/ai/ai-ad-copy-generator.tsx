import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiAdCopyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-ad-copy-generator')!} />;
}
