import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2 } from 'lucide-react';

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Daily at noon', expr: '0 12 * * *' },
  { label: 'Every Sunday', expr: '0 0 * * 0' },
  { label: 'Every Monday', expr: '0 0 * * 1' },
  { label: '1st of month', expr: '0 0 1 * *' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Twice a day', expr: '0 0,12 * * *' },
];

function describeField(val: string, unit: string, max: number): string {
  if (val === '*') return `every ${unit}`;
  if (val.startsWith('*/')) return `every ${val.slice(2)} ${unit}s`;
  const parts = val.split(',').map(v => {
    const [s, e] = v.split('-');
    return e ? `${s}–${e}` : s;
  });
  return `at ${unit} ${parts.join(', ')}`;
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid expression (needs 5 fields)';
  const [min, hr, dom, mon, dow] = parts;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (expr === '* * * * *') return 'Runs every minute';
  if (expr === '0 * * * *') return 'Runs at the start of every hour';
  if (expr === '0 0 * * *') return 'Runs daily at midnight';

  let desc = 'Runs ';
  if (min !== '*' || hr !== '*') {
    desc += `${describeField(min, 'minute', 59)}, ${describeField(hr, 'hour', 23)}`;
  } else {
    desc += 'every minute';
  }
  if (dom !== '*') desc += `, on day ${dom} of the month`;
  if (mon !== '*') desc += `, in month ${mon.split(',').map(m => months[parseInt(m)-1] ?? m).join(', ')}`;
  if (dow !== '*') desc += `, on ${dow.split(',').map(d => days[parseInt(d)] ?? d).join(', ')}`;
  return desc;
}

function nextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [minF, hrF, domF, monF, dowF] = parts;

  function matches(field: string, val: number, min: number, max: number): boolean {
    if (field === '*') return true;
    return field.split(',').some(p => {
      if (p.startsWith('*/')) return val % parseInt(p.slice(2)) === 0;
      const [s, e] = p.split('-').map(Number);
      return isNaN(e) ? s === val : val >= s && val <= e;
    });
  }

  const runs: Date[] = [];
  const now = new Date();
  now.setSeconds(0, 0);
  const d = new Date(now.getTime() + 60000); // start from next minute

  for (let i = 0; i < 100000 && runs.length < count; i++) {
    if (
      matches(monF, d.getMonth() + 1, 1, 12) &&
      matches(domF, d.getDate(), 1, 31) &&
      matches(dowF, d.getDay(), 0, 6) &&
      matches(hrF, d.getHours(), 0, 23) &&
      matches(minF, d.getMinutes(), 0, 59)
    ) {
      runs.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return runs;
}

export default function CronGenerator() {
  const tool = getToolBySlug('cron-generator')!;
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [copied, setCopied] = useState(false);

  const description = describeCron(expr);
  const runs = nextRuns(expr);

  function copy() {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function applyPreset(e: string) { setExpr(e); }

  const parts = expr.trim().split(/\s+/);
  const fieldLabels = ['Minute (0–59)', 'Hour (0–23)', 'Day (1–31)', 'Month (1–12)', 'Weekday (0–6, Sun=0)'];

  function updateField(i: number, val: string) {
    const p = [...(parts.length === 5 ? parts : ['*','*','*','*','*'])];
    p[i] = val || '*';
    setExpr(p.join(' '));
  }

  return (
    <ToolLayout tool={tool} instructions="Use the fields or presets to build a cron expression. See next 5 scheduled runs.">
      {/* Presets */}
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <Button key={p.expr} size="sm" variant="outline" onClick={() => applyPreset(p.expr)}>{p.label}</Button>
          ))}
        </div>
      </div>

      {/* Field editors */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {fieldLabels.map((label, i) => (
          <div key={label}>
            <label className="text-xs text-muted-foreground mb-1 block truncate">{label}</label>
            <Input
              className="font-mono text-center text-sm"
              value={parts[i] ?? '*'}
              onChange={e => updateField(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Expression + copy */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border mb-4">
        <code className="flex-1 font-mono text-lg font-bold tracking-widest">{expr}</code>
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Description */}
      <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm font-medium text-primary">{description}</div>

      {/* Next runs */}
      {runs.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Next {runs.length} scheduled runs</p>
          <div className="space-y-1">
            {runs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-sm px-3 py-1.5 rounded bg-muted/20">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <span className="font-mono">{d.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
