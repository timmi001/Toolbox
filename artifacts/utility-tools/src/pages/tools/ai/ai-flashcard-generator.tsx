import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiFlashcardGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-flashcard-generator')!} />;
}
