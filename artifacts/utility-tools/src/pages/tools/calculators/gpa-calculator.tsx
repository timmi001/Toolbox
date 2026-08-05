import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GRADE_POINTS: Record<string, number> = {
  'A+': 5.0, 'A': 5.0, 'B+': 4.5, 'B': 4.0, 'C+': 3.5, 'C': 3.0, 'D+': 2.5, 'D': 2.0, 'E': 1.5, 'F': 0.0,
  // US 4.0 scale aliases
  'A-': 3.7, 'B-': 2.7, 'C-': 1.7, 'D-': 1.0,
};

const GRADE_POINTS_5: Record<string, number> = {
  'A+': 5.0, 'A': 5.0, 'B+': 4.5, 'B': 4.0, 'C+': 3.5, 'C': 3.0, 'D+': 2.5, 'D': 2.0, 'E': 1.5, 'F': 0.0,
};

const GRADE_POINTS_4: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

interface Course { name: string; grade: string; credits: string; }

export default function GpaCalculator() {
  const tool = getToolBySlug('gpa-calculator')!;
  const [scale, setScale] = useState<'5.0' | '4.0'>('5.0');
  const [courses, setCourses] = useState<Course[]>([
    { name: 'MTH 101', grade: 'A', credits: '3' },
    { name: 'ENG 101', grade: 'B', credits: '3' },
    { name: 'PHY 101', grade: 'B+', credits: '3' },
  ]);

  // CGPA mode
  const [cgpaMode, setCgpaMode] = useState(false);
  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const gradePoints = scale === '5.0' ? GRADE_POINTS_5 : GRADE_POINTS_4;
  const gradeOptions = Object.keys(gradePoints);
  const maxScale = scale === '5.0' ? 5.0 : 4.0;

  function update(i: number, field: keyof Course, value: string) {
    setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }
  function addCourse() { setCourses(prev => [...prev, { name: '', grade: gradeOptions[0], credits: '3' }]); }
  function remove(i: number) { setCourses(prev => prev.filter((_, idx) => idx !== i)); }

  const validCourses = courses.filter(c => gradePoints[c.grade] !== undefined && parseFloat(c.credits) > 0);
  const semCredits = validCourses.reduce((sum, c) => sum + parseFloat(c.credits), 0);
  const semPoints = validCourses.reduce((sum, c) => sum + gradePoints[c.grade] * parseFloat(c.credits), 0);
  const semGpa = semCredits > 0 ? semPoints / semCredits : 0;

  // CGPA calculation
  const prevC = parseFloat(prevCredits) || 0;
  const prevG = parseFloat(prevCgpa) || 0;
  const totalCredits = semCredits + prevC;
  const cgpa = totalCredits > 0 ? (semPoints + prevG * prevC) / totalCredits : semGpa;

  return (
    <ToolLayout tool={tool} instructions="Add your courses, choose a grading scale, and optionally enter your previous CGPA to compute a cumulative GPA.">
      {/* Scale selector */}
      <div className="flex gap-2 mb-5">
        <span className="text-sm font-medium text-muted-foreground self-center">Scale:</span>
        {(['5.0', '4.0'] as const).map(s => (
          <button
            key={s}
            onClick={() => setScale(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${scale === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
          >
            {s} Scale
          </button>
        ))}
      </div>

      {/* Courses */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-[1fr_80px_70px_36px] gap-2 text-xs text-muted-foreground px-1">
          <span>Course</span><span>Grade</span><span>Credits</span><span />
        </div>
        {courses.map((course, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_70px_36px] gap-2 items-center">
            <Input value={course.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Course name" className="text-sm" />
            <select value={course.grade} onChange={(e) => update(i, 'grade', e.target.value)} className="bg-background border border-border rounded-lg px-2 py-2 text-sm w-full">
              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input type="number" value={course.credits} onChange={(e) => update(i, 'credits', e.target.value)} min="0" step="0.5" className="text-sm text-center" placeholder="Cr" />
            <Button variant="ghost" size="sm" onClick={() => remove(i)} className="text-destructive h-9 px-2">×</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={addCourse} className="w-full mb-6">+ Add Course</Button>

      {/* Results */}
      {semCredits > 0 && (
        <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl mb-6">
          <div className="text-5xl font-extrabold text-primary">{semGpa.toFixed(2)}</div>
          <div className="text-muted-foreground mt-1">Semester GPA (out of {maxScale.toFixed(1)})</div>
          <div className="text-sm text-muted-foreground mt-2">{semCredits} credit hours · {validCourses.length} courses</div>
        </div>
      )}

      {/* CGPA section */}
      <div className="border border-border rounded-xl p-4">
        <button
          onClick={() => setCgpaMode(m => !m)}
          className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
        >
          <span className={`transition-transform ${cgpaMode ? 'rotate-90' : ''}`}>▶</span>
          Calculate Cumulative GPA (CGPA)
        </button>
        {cgpaMode && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">Enter your GPA and total credits from all previous semesters.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Previous CGPA</label>
                <Input type="number" value={prevCgpa} onChange={e => setPrevCgpa(e.target.value)} placeholder={`e.g. 3.50`} step="0.01" min="0" max={maxScale} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Total Previous Credits</label>
                <Input type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} placeholder="e.g. 60" step="1" min="0" className="text-sm" />
              </div>
            </div>
            {totalCredits > 0 && prevC > 0 && (
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-2">
                <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{cgpa.toFixed(2)}</div>
                <div className="text-muted-foreground mt-1 text-sm">Cumulative GPA (out of {maxScale.toFixed(1)})</div>
                <div className="text-xs text-muted-foreground mt-1">{totalCredits} total credit hours</div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
