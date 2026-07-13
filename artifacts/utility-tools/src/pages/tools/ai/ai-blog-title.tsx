import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBlogTitle() {
  return <AiToolShell tool={getToolBySlug('ai-blog-title')!} />;
}
