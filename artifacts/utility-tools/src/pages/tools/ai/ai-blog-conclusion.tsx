import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBlogConclusion() {
  return <AiToolShell tool={getToolBySlug('ai-blog-conclusion')!} />;
}
