import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function AverageCalculator() {
  const tool = getToolBySlug('average-calculator')!;
  const [input, setInput] = useState('5, 10, 15, 20, 25');
  const [result, setResult] = useState<Record<string, string> | null>(null);

  function calculate() {
    const nums = input.split(/[\s,\n]+/).map(Number).filter(n => !isNaN(n));
    if (nums.length === 0) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const n = sorted.length;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const freq: Record<number, number> = {};
    nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([n]) => n);
    const variance = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
    const std = Math.sqrt(variance);
    setResult({
      'Count': String(nums.length),
      'Sum': nums.reduce((a, b) => a + b, 0).toFixed(4),
      'Mean (Average)': mean.toFixed(4),
      'Median': median.toFixed(4),
      'Mode': modes.join(', '),
      'Min': sorted[0].toFixed(4),
      'Max': sorted[sorted.length - 1].toFixed(4),
      'Range': (sorted[sorted.length - 1] - sorted[0]).toFixed(4),
      'Variance': variance.toFixed(4),
      'Std Deviation': std.toFixed(4),
    });
  }

  return (
    <ToolLayout tool={tool} instructions="Enter numbers separated by commas or new lines to calculate statistics.">
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[100px] font-mono mb-4" placeholder="Enter numbers: 5, 10, 15, 20, 25" />
      <Button onClick={calculate} className="w-full mb-6">Calculate</Button>
      {result && (
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="flex justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-sm font-mono font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
