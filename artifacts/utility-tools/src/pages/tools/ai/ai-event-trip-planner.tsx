import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiEventTripPlanner() {
  return <AiToolShell tool={getToolBySlug('ai-event-trip-planner')!} />;
}
