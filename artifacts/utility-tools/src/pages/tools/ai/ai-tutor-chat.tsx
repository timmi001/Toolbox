import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTutorChat() {
  return <AiToolShell tool={getToolBySlug('ai-tutor-chat')!} />;
}
