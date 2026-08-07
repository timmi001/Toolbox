import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTicketFinder() {
  return <AiToolShell tool={getToolBySlug('ai-ticket-finder')!} />;
}
