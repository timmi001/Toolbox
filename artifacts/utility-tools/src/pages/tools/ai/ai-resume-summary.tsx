import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiResumeSummary() {
  return <AiToolShell tool={getToolBySlug('ai-resume-summary')!} />;
}
