import { AiToolShell } from '@/components/AiToolShell';
import { getToolBySlug } from '@/lib/tools-data';

export default function AiEventInvitation() {
  return <AiToolShell tool={getToolBySlug('ai-event-invitation')!} />;
}
