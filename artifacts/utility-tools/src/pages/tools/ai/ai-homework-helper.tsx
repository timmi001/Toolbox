import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiHomeworkHelper() {
  return <StudyToolShell tool={getToolBySlug('ai-homework-helper')!} />;
}
