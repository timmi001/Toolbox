import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DateDifference() {
  const tool = getToolBySlug('date-difference')!;
  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const d1 = new Date(from), d2 = new Date(to);
  const valid = !isNaN(d1.getTime()) && !isNaN(d2.getTime());
  const diff = valid ? Math.abs(d2.getTime() - d1.getTime()) : 0;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.abs(d2.getMonth() - d1.getMonth() + (d2.getFullYear() - d1.getFullYear()) * 12);
  const years = Math.abs(d2.getFullYear() - d1.getFullYear());
  const label = d2 >= d1 ? 'after' : 'before';

  return (
    <ToolLayout tool={tool} instructions="Select two dates to calculate the difference between them.">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">From Date</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">To Date</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      {valid && (
        <div>
          <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl mb-4">
            <div className="text-5xl font-extrabold text-primary">{days.toLocaleString()}</div>
            <div className="text-muted-foreground">days {label}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Weeks', value: weeks.toLocaleString() },
              { label: 'Months (approx)', value: months },
              { label: 'Years (approx)', value: years },
              { label: 'Hours', value: (days * 24).toLocaleString() },
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
