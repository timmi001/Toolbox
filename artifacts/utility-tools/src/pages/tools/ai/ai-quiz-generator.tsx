import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiQuizGenerator() {
  return <StudyToolShell tool={getToolBySlug('ai-quiz-generator')!} />;
}
