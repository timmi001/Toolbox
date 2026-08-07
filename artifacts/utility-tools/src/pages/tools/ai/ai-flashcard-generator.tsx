import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiFlashcardGenerator() {
  return <StudyToolShell tool={getToolBySlug('ai-flashcard-generator')!} />;
}
