import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBlogIntroduction() {
  return <AiToolShell tool={getToolBySlug('ai-blog-introduction')!} />;
}
