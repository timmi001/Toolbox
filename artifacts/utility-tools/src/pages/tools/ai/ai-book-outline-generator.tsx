import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

export default function AiBookOutlineGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-book-outline-generator')!} />;
}
