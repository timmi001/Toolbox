import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiInterviewPractice() {
  return <AiToolShell tool={getToolBySlug('ai-interview-practice')!} />;
}
