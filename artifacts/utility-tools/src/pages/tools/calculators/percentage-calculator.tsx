import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PercentageCalculator() {
  const tool = getToolBySlug('percentage-calculator')!;
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [mode, setMode] = useState<'pct-of' | 'what-pct' | 'increase'>('pct-of');

  let result = '';
  const na = parseFloat(a), nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb)) {
    if (mode === 'pct-of') result = `${((na / 100) * nb).toFixed(4)} (${na}% of ${nb})`;
    else if (mode === 'what-pct') result = `${((na / nb) * 100).toFixed(4)}% (${na} is what % of ${nb})`;
    else result = `${(((nb - na) / na) * 100).toFixed(2)}% change (${na} → ${nb})`;
  }

  const modes = [
    { key: 'pct-of', label: '% of Number', labelA: 'Percentage (%)', labelB: 'Number' },
    { key: 'what-pct', label: 'What % is', labelA: 'Value', labelB: 'Total' },
    { key: 'increase', label: '% Change', labelA: 'From', labelB: 'To' },
  ] as const;

  const activeMode = modes.find(m => m.key === mode)!;

  return (
    <ToolLayout tool={tool} instructions="Select a calculation type, enter values, and see the result instantly.">
      <div className="flex gap-2 mb-6 flex-wrap">
        {modes.map(m => (
          <Button key={m.key} variant={mode === m.key ? 'default' : 'outline'} onClick={() => setMode(m.key)} className="flex-1 min-w-[120px]">{m.label}</Button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{activeMode.labelA}</label>
          <Input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{activeMode.labelB}</label>
          <Input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder="0" />
        </div>
      </div>
      {result && (
        <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl text-center">
          <div className="text-3xl font-extrabold text-primary">{result.split(' (')[0]}</div>
          <div className="text-muted-foreground text-sm mt-1">{result.split(' (')[1]?.replace(')', '') || ''}</div>
        </div>
      )}
    </ToolLayout>
  );
}
