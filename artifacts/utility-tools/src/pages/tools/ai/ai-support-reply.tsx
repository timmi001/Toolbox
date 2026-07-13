import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSupportReply() {
  return <AiToolShell tool={getToolBySlug('ai-support-reply')!} />;
}
