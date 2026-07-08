import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiCtaGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-cta-generator')!} />;
}
