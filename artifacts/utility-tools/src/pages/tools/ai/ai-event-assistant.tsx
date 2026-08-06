import { AiToolShell } from '@/components/AiToolShell';
import { getToolBySlug } from '@/lib/tools-data';

export default function AiEventAssistant() {
  return <AiToolShell tool={getToolBySlug('ai-event-assistant')!} />;
}
