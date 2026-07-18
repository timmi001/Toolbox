import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

export default function AiStudyPlanner() {
  return <AiToolShell tool={getToolBySlug('ai-study-planner')!} />;
}
