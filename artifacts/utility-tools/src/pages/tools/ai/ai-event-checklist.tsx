import { AiToolShell } from '@/components/AiToolShell';
import { getToolBySlug } from '@/lib/tools-data';

export default function AiEventChecklist() {
  return <AiToolShell tool={getToolBySlug('ai-event-checklist')!} />;
}
