import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiBugFinder() {
  return <AiToolShell tool={getToolBySlug('ai-bug-finder')!} />;
}
