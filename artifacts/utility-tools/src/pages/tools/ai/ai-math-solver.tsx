import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiMathSolver() {
  return (
    <AiToolShell
      tool={getToolBySlug('ai-math-solver')!}
    />
  );
}
