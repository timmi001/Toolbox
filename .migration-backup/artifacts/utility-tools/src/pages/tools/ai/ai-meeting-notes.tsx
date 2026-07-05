import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiMeetingNotes() {
  return <AiToolShell tool={getToolBySlug('ai-meeting-notes')!} />;
}
