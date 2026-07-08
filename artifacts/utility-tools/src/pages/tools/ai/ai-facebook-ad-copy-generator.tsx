import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiFacebookAdCopyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-facebook-ad-copy-generator')!} />;
}
