import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

interface Course { name: string; grade: string; credits: string; }

export default function GpaCalculator() {
  const tool = getToolBySlug('gpa-calculator')!;
  const [courses, setCourses] = useState<Course[]>([
    { name: 'Math 101', grade: 'A', credits: '3' },
    { name: 'English 101', grade: 'B+', credits: '3' },
    { name: 'History 101', grade: 'A-', credits: '3' },
  ]);

  function update(i: number, field: keyof Course, value: string) {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  function addCourse() { setCourses(prev => [...prev, { name: '', grade: 'A', credits: '3' }]); }
  function remove(i: number) { setCourses(prev => prev.filter((_, idx) => idx !== i)); }

  const validCourses = courses.filter(c => GRADE_POINTS[c.grade] !== undefined && parseFloat(c.credits) > 0);
  const totalCredits = validCourses.reduce((sum, c) => sum + parseFloat(c.credits), 0);
  const totalPoints = validCourses.reduce((sum, c) => sum + GRADE_POINTS[c.grade] * parseFloat(c.credits), 0);
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return (
    <ToolLayout tool={tool} instructions="Add your courses with grades and credit hours to calculate your GPA.">
      <div className="space-y-2 mb-4">
        {courses.map((course, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input value={course.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Course name" className="flex-1 text-sm" />
            <select value={course.grade} onChange={(e) => update(i, 'grade', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-2 text-sm w-20">
              {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input type="number" value={course.credits} onChange={(e) => update(i, 'credits', e.target.value)} min="0" className="w-20 text-sm text-center" placeholder="Cr" />
            <Button variant="ghost" size="sm" onClick={() => remove(i)} className="text-destructive h-9">×</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={addCourse} className="w-full mb-6">+ Add Course</Button>
      {totalCredits > 0 && (
        <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="text-5xl font-extrabold text-primary">{gpa.toFixed(2)}</div>
          <div className="text-muted-foreground mt-1">GPA (out of 4.0)</div>
          <div className="text-sm text-muted-foreground mt-2">{totalCredits} credit hours · {validCourses.length} courses</div>
        </div>
      )}
    </ToolLayout>
  );
}
