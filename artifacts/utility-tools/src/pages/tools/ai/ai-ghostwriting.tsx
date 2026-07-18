import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiGhostwriting() {
  return <AiToolShell tool={getToolBySlug('ai-ghostwriting')!} />;
}
