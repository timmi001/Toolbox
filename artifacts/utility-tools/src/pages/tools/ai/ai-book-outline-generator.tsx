import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBookOutlineGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-book-outline-generator')!} />;
}
