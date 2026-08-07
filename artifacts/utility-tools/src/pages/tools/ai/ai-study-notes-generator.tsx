import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiStudyNotesGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-study-notes-generator')!} />;
}
