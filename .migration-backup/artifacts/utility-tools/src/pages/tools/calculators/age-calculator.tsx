import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AgeCalculator() {
  const tool = getToolBySlug('age-calculator')!;
  const [dob, setDob] = useState('');
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null);

  function calculate() {
    const birth = new Date(dob);
    const target = new Date(to);
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return;
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    setResult({ years, months, days, totalDays });
  }

  return (
    <ToolLayout tool={tool} instructions="Enter your date of birth and the target date to calculate exact age.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Date of Birth</label>
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={to} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Age On Date</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} disabled={!dob} className="w-full mb-6">Calculate Age</Button>
      {result && (
        <div>
          <div className="text-center mb-6 p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="text-5xl font-extrabold text-primary">{result.years}</div>
            <div className="text-muted-foreground">years old</div>
            <div className="text-lg mt-2 font-medium">{result.months} months, {result.days} days</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Days', value: result.totalDays.toLocaleString() },
              { label: 'Total Months', value: (result.years * 12 + result.months).toLocaleString() },
              { label: 'Total Weeks', value: Math.floor(result.totalDays / 7).toLocaleString() },
              { label: 'Total Hours', value: (result.totalDays * 24).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
