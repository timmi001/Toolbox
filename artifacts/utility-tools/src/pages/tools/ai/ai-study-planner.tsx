import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiStudyPlanner() {
  return <StudyToolShell tool={getToolBySlug('ai-study-planner')!} />;
}
