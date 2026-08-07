import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiMockExamGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-mock-exam-generator')!} />;
}
