import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiEventSearch() {
  return <AiToolShell tool={getToolBySlug('ai-event-search')!} />;
}
