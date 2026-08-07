import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPreviousQuestionGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-previous-question-generator')!} />;
}
