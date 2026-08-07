import { getToolBySlug } from '@/lib/tools-data';
import { StudyToolShell } from '@/components/StudyToolShell';

export default function AiMathSolver() {
  return (
    <StudyToolShell
      tool={getToolBySlug('ai-math-solver')!}
    />
  );
}
