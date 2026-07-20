import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiJambCbtPractice() {
  return (
    <AiToolShell
      tool={getToolBySlug('ai-jamb-cbt-practice')!}
    />
  );
}
