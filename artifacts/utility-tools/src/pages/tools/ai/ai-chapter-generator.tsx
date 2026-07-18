import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiChapterGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-chapter-generator')!} />;
}
