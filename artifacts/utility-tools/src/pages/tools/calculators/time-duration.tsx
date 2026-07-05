import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function toMinutes(h: number, m: number, s: number) { return h * 60 + m + s / 60; }
function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  const s = Math.round((total % 1) * 60);
  return { h, m, s };
}
function pad(n: number) { return n.toString().padStart(2, '0'); }

export default function TimeDuration() {
  const tool = getToolBySlug('time-duration')!;
  const [t1, setT1] = useState({ h: '0', m: '0', s: '0' });
  const [t2, setT2] = useState({ h: '0', m: '0', s: '0' });
  const [op, setOp] = useState<'+' | '-'>('+');

  const mins1 = toMinutes(+t1.h, +t1.m, +t1.s);
  const mins2 = toMinutes(+t2.h, +t2.m, +t2.s);
  const total = op === '+' ? mins1 + mins2 : Math.abs(mins1 - mins2);
  const res = fromMinutes(total);

  function TimeInput({ label, val, set }: { label: string; val: typeof t1; set: typeof setT1 }) {
    return (
      <div>
        <div className="text-sm text-muted-foreground mb-2">{label}</div>
        <div className="flex gap-2 items-center">
          <div className="text-center">
            <Input type="number" min={0} value={val.h} onChange={e => set(v => ({ ...v, h: e.target.value }))} className="w-20 text-center font-mono" />
            <div className="text-xs text-muted-foreground mt-1">hours</div>
          </div>
          <span className="text-xl text-muted-foreground">:</span>
          <div className="text-center">
            <Input type="number" min={0} max={59} value={val.m} onChange={e => set(v => ({ ...v, m: e.target.value }))} className="w-20 text-center font-mono" />
            <div className="text-xs text-muted-foreground mt-1">minutes</div>
          </div>
          <span className="text-xl text-muted-foreground">:</span>
          <div className="text-center">
            <Input type="number" min={0} max={59} value={val.s} onChange={e => set(v => ({ ...v, s: e.target.value }))} className="w-20 text-center font-mono" />
            <div className="text-xs text-muted-foreground mt-1">seconds</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToolLayout tool={tool} instructions="Enter two time durations and choose to add or subtract them.">
      <div className="space-y-6 mb-6">
        <TimeInput label="Duration 1" val={t1} set={setT1} />
        <div className="flex gap-2">
          <Button variant={op === '+' ? 'default' : 'outline'} onClick={() => setOp('+')} className="flex-1">Add (+)</Button>
          <Button variant={op === '-' ? 'default' : 'outline'} onClick={() => setOp('-')} className="flex-1">Subtract (−)</Button>
        </div>
        <TimeInput label="Duration 2" val={t2} set={setT2} />
      </div>
      <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Result</div>
        <div className="text-4xl font-extrabold text-primary font-mono">{pad(res.h)}:{pad(res.m)}:{pad(res.s)}</div>
        <div className="text-muted-foreground mt-2">{res.h > 0 ? `${res.h} hours ` : ''}{res.m} minutes {res.s} seconds</div>
      </div>
    </ToolLayout>
  );
}
