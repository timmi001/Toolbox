import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiGoogleAdsCopyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-google-ads-copy-generator')!} />;
}
