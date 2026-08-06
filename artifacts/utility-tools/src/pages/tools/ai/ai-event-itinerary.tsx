import { AiToolShell } from '@/components/AiToolShell';
import { getToolBySlug } from '@/lib/tools-data';

export default function AiEventItinerary() {
  return <AiToolShell tool={getToolBySlug('ai-event-itinerary')!} />;
}
