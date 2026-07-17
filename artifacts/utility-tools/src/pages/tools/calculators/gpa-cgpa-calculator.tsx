import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GpaCgpaCalculator() {
  const tool = getToolBySlug('gpa-cgpa-calculator')!;
  const [courses, setCourses] = useState('English A, Mathematics, Biology');
  const [grades, setGrades] = useState('A, B, C');
  const [credits, setCredits] = useState('3, 4, 3');

  const result = useMemo(() => {
    const gradeValues: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    const gradeList = grades.split(',').map(item => item.trim().toUpperCase());
    const creditList = credits.split(',').map(item => Number(item.trim()));
    const totalCredits = creditList.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    const totalPoints = gradeList.reduce((sum, grade, index) => {
      const value = gradeValues[grade] ?? 0;
      const credit = creditList[index] ?? 0;
      return sum + value * credit;
    }, 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { gpa: gpa.toFixed(2), totalCredits, totalPoints };
  }, [grades, credits]);

  return (
    <ToolLayout tool={tool} instructions="Enter your course names, grades, and credit units to estimate GPA/CGPA.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <Input value={courses} onChange={(e) => setCourses(e.target.value)} placeholder="Course names (comma separated)" />
          <Input value={grades} onChange={(e) => setGrades(e.target.value)} placeholder="Grades (A, B, C...)" />
          <Input value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="Credit units (3, 4, 2...)" />
          <p className="text-sm text-muted-foreground">Example: Mathematics, English, Physics with grades A, B, C and credits 4, 3, 3.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Estimated GPA/CGPA</div>
            <div className="text-4xl font-extrabold text-primary">{result.gpa}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-background p-3"><div className="text-muted-foreground">Total Credits</div><div className="font-semibold">{result.totalCredits}</div></div>
            <div className="rounded-lg bg-background p-3"><div className="text-muted-foreground">Total Points</div><div className="font-semibold">{result.totalPoints}</div></div>
          </div>
          <Button variant="outline" onClick={() => {setCourses('English A, Mathematics, Biology'); setGrades('A, B, C'); setCredits('3, 4, 3');}}>Reset Example</Button>
        </div>
      </div>
    </ToolLayout>
  );
}
