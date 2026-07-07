import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PregnancyDueDate() {
  const tool = getToolBySlug('pregnancy-due-date')!;
  const today = new Date();
  const [lmp, setLmp] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - 14); return d.toISOString().split('T')[0];
  });
  const [cycle, setCycle] = useState('28');

  const lmpDate = new Date(lmp + 'T00:00:00');
  const cycleLen = parseInt(cycle) || 28;
  const ovulationOffset = cycleLen - 14;
  const dueDate = addDays(lmpDate, 280 - (28 - cycleLen)); // Naegele's rule adjusted
  const conception = addDays(lmpDate, ovulationOffset);

  const todayMs = today.getTime();
  const lmpMs = lmpDate.getTime();
  const weeksPregnant = Math.max(0, Math.floor((todayMs - lmpMs) / (7 * 86400000)));
  const daysExtra = Math.max(0, Math.floor(((todayMs - lmpMs) % (7 * 86400000)) / 86400000));
  const daysLeft = Math.max(0, Math.round((dueDate.getTime() - todayMs) / 86400000));
  const trimester = weeksPregnant < 13 ? 1 : weeksPregnant < 27 ? 2 : 3;

  const milestones = [
    { label: 'Conception (est.)', date: conception, week: ovulationOffset / 7 },
    { label: '1st trimester ends', date: addDays(lmpDate, 13 * 7), week: 13 },
    { label: '20-week scan', date: addDays(lmpDate, 20 * 7), week: 20 },
    { label: '2nd trimester ends', date: addDays(lmpDate, 27 * 7), week: 27 },
    { label: 'Full term (37 weeks)', date: addDays(lmpDate, 37 * 7), week: 37 },
    { label: 'Due date (40 weeks)', date: dueDate, week: 40 },
  ];

  const pct = Math.min((weeksPregnant / 40) * 100, 100);

  return (
    <ToolLayout tool={tool} instructions="Enter your last menstrual period date to calculate your estimated due date and milestones.">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">First day of last period (LMP)</label>
          <Input type="date" value={lmp} onChange={e => setLmp(e.target.value)} max={today.toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Average cycle length (days)</label>
          <Input type="number" min={20} max={45} value={cycle} onChange={e => setCycle(e.target.value)} />
        </div>
      </div>

      {/* Due date hero */}
      <div className="text-center p-5 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900 mb-5">
        <p className="text-xs text-pink-500 uppercase tracking-widest mb-1">Estimated Due Date</p>
        <p className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">{fmtShort(dueDate)}</p>
        <p className="text-sm text-muted-foreground mt-1">{fmt(dueDate)}</p>
      </div>

      {/* Current status */}
      {weeksPregnant > 0 && weeksPregnant <= 44 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Week {weeksPregnant}{daysExtra > 0 ? ` +${daysExtra}d` : ''} — Trimester {trimester}</span>
            <span>{daysLeft} days left</span>
          </div>
          <div className="h-3 rounded-full bg-muted/20 overflow-hidden">
            <div className="bg-pink-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>LMP</span><span>40 weeks</span>
          </div>
        </div>
      )}

      {/* Milestones */}
      <p className="text-sm font-medium mb-3">Pregnancy milestones</p>
      <div className="space-y-2">
        {milestones.map(({ label, date, week }) => {
          const isPast = date < today;
          const isCurrent = Math.floor(weeksPregnant) === Math.floor(week);
          return (
            <div key={label} className={`flex items-center gap-4 p-3 rounded-lg border text-sm ${isCurrent ? 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900' : isPast ? 'opacity-60' : 'bg-muted/20'}`}>
              <span className={`w-16 text-center text-xs font-medium rounded-full py-0.5 ${isPast ? 'bg-muted text-muted-foreground' : 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400'}`}>Week {week}</span>
              <span className="flex-1 font-medium">{label}</span>
              <span className="text-muted-foreground text-xs">{fmtShort(date)}</span>
            </div>
          );
        })}
      </div>
    </ToolLayout>
  );
}
