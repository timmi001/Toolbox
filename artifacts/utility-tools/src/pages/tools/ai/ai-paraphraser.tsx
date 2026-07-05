import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiParaphraser() {
  return <AiToolShell tool={getToolBySlug('ai-paraphraser')!} />;
}
