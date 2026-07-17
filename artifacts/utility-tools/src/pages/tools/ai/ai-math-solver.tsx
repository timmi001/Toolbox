import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function solveMath(problem: string, method: string) {
  const clean = problem.trim() || '2x + 5 = 15';
  return `Math Solution\n\nProblem: ${clean}\n\nMethod: ${method || 'Step-by-step'}\n\n1. Identify the unknown and isolate it.\n2. Apply the correct operation to both sides.\n3. Simplify the result and verify the answer.\n\nExample answer:\nIf the problem is a simple linear equation, solve by isolating the variable and checking the result in the original equation.`;
}

export default function AiMathSolver() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-math-solver')!}
      fields={[
        { key: 'problem', label: 'Math Problem', type: 'textarea', required: true, rows: 6, placeholder: 'e.g. Solve 2x + 5 = 15' },
        { key: 'method', label: 'Preferred Method', type: 'select', options: ['Step-by-step', 'Short Answer', 'Exam-style'] },
      ]}
      buttonLabel="Solve Problem"
      generate={(inputs) => solveMath(inputs.problem ?? '', inputs.method ?? '')}
      emptyState="Enter a math question and get a guided solution outline."
      instructions="Use this tool to break down algebra and arithmetic problems into clear steps."
    />
  );
}
