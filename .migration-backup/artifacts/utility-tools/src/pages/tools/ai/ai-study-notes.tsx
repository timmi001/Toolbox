import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiStudyNotes() {
  return <AiToolShell tool={getToolBySlug('ai-study-notes')!} />;
}
