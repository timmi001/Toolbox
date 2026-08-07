import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiNearbyEvents() {
  return <AiToolShell tool={getToolBySlug('ai-nearby-events')!} />;
}
