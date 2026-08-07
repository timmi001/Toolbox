import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiStudyNotes() {
  return <StudyToolShell tool={getToolBySlug('ai-study-notes')!} />;
}
