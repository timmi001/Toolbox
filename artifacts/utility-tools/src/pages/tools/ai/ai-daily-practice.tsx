import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiDailyPractice() {
  return <AiToolShell tool={getToolBySlug('ai-daily-practice')!} />;
}
