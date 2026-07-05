import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiMetaDescription() {
  return <AiToolShell tool={getToolBySlug('ai-meta-description')!} />;
}
