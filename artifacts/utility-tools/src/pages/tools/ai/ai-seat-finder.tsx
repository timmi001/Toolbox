import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSeatFinder() {
  return <AiToolShell tool={getToolBySlug('ai-seat-finder')!} />;
}
