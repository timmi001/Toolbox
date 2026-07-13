import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiFollowupEmail() {
  return <AiToolShell tool={getToolBySlug('ai-followup-email')!} />;
}
