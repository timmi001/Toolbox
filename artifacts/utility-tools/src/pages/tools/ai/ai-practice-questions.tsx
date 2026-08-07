import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPracticeQuestions() {
  return <AiToolShell tool={getToolBySlug('ai-practice-questions')!} />;
}
