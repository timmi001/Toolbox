import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBlogOutline() {
  return <AiToolShell tool={getToolBySlug('ai-blog-outline')!} />;
}
