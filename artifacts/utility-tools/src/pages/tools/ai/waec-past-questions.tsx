import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function WaecPastQuestions() {
  return <AiToolShell tool={getToolBySlug('waec-past-questions')!} />;
}
