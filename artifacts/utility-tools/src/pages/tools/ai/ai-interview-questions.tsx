import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiInterviewQuestions() {
  return <AiToolShell tool={getToolBySlug('ai-interview-questions')!} />;
}
