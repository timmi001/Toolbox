import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTicketAlerts() {
  return <AiToolShell tool={getToolBySlug('ai-ticket-alerts')!} />;
}
