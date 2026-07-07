import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Moon, Sunrise } from 'lucide-react';

const CYCLE = 90; // minutes per sleep cycle
const FALL_ASLEEP = 14; // avg minutes to fall asleep

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h * 60 + m + mins + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60), nm = total % 60;
  const ampm = nh < 12 ? 'AM' : 'PM';
  const displayH = nh === 0 ? 12 : nh > 12 ? nh - 12 : nh;
  return `${displayH}:${String(nm).padStart(2, '0')} ${ampm}`;
}

function cycleLabel(n: number) {
  const h = Math.floor((n * CYCLE) / 60), m = (n * CYCLE) % 60;
  return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm' : ''}`.trim();
}

export default function SleepCalculator() {
  const tool = getToolBySlug('sleep-calculator')!;
  const [mode, setMode] = useState<'wake' | 'bed'>('wake');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  });

  const CYCLES = [4, 5, 6, 7, 8]; // number of cycles

  const results = CYCLES.map(n => {
    const totalMins = n * CYCLE;
    if (mode === 'wake') {
      // bedtime = wakeTime - cycles - fall-asleep
      const bedtime = addMinutes(time, -(totalMins + FALL_ASLEEP));
      return { cycles: n, time: bedtime, duration: cycleLabel(n) };
    } else {
      // wake = bedtime + fall-asleep + cycles
      const wake = addMinutes(time, FALL_ASLEEP + totalMins);
      return { cycles: n, time: wake, duration: cycleLabel(n) };
    }
  });

  const ideal = results.find(r => r.cycles === 6);

  return (
    <ToolLayout tool={tool} instructions="Find the best times to sleep or wake up based on 90-minute sleep cycles.">
      <div className="flex gap-2 mb-5">
        <Button variant={mode === 'wake' ? 'default' : 'outline'} onClick={() => setMode('wake')} className="flex-1">
          <Sunrise className="mr-2 h-4 w-4" /> I want to wake up at…
        </Button>
        <Button variant={mode === 'bed' ? 'default' : 'outline'} onClick={() => setMode('bed')} className="flex-1">
          <Moon className="mr-2 h-4 w-4" /> I'm going to bed at…
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-muted-foreground shrink-0">
          {mode === 'wake' ? 'Wake-up time' : 'Bedtime'}
        </label>
        <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-40 font-mono text-lg" />
      </div>

      <div className="mb-3 text-sm text-muted-foreground">
        {mode === 'wake'
          ? `Best times to go to sleep if you want to wake at ${addMinutes(time, 0)} feeling refreshed:`
          : `Best times to wake up if you go to bed at ${addMinutes(time, 0)}:`}
        <span className="text-xs ml-2">(includes ~{FALL_ASLEEP} min to fall asleep)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-5">
        {results.map(r => (
          <div key={r.cycles}
            className={`text-center p-4 rounded-xl border transition-colors ${r.cycles === 6 ? 'bg-primary/10 border-primary/30' : r.cycles >= 5 && r.cycles <= 7 ? 'bg-muted/30' : 'bg-muted/10'}`}>
            <div className={`text-2xl font-extrabold mb-1 ${r.cycles === 6 ? 'text-primary' : ''}`}>{r.time}</div>
            <div className="text-xs text-muted-foreground">{r.cycles} cycles</div>
            <div className="text-xs font-medium mt-0.5">{r.duration}</div>
            {r.cycles === 6 && <div className="text-xs text-primary font-semibold mt-1">⭐ Ideal</div>}
          </div>
        ))}
      </div>

      {/* Sleep tips */}
      <div className="rounded-xl border bg-muted/20 p-4">
        <p className="text-sm font-medium mb-2">Why 90-minute cycles?</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>One sleep cycle (light → deep → REM) takes ~90 minutes</li>
          <li>Waking mid-cycle causes grogginess (sleep inertia)</li>
          <li>5–6 cycles (7.5–9h) is ideal for most adults</li>
          <li>Waking at the end of a cycle leaves you refreshed</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
