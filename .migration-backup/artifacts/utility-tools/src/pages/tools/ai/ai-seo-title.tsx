import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSeoTitle() {
  return <AiToolShell tool={getToolBySlug('ai-seo-title')!} />;
}
