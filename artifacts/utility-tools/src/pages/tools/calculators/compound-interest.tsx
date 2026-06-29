import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CompoundInterest() {
  const tool = getToolBySlug('compound-interest')!;
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('10');
  const [freq, setFreq] = useState('12');

  const p = parseFloat(principal), r = parseFloat(rate) / 100, n = parseFloat(freq), t = parseFloat(years);
  const valid = [p, r, n, t].every(v => !isNaN(v) && v > 0);
  const finalAmount = valid ? p * Math.pow(1 + r / n, n * t) : 0;
  const totalInterest = finalAmount - p;

  const dataPoints = valid ? Array.from({ length: Math.floor(t) + 1 }, (_, i) => ({
    year: i,
    amount: p * Math.pow(1 + r / n, n * i),
  })) : [];
  const maxAmount = dataPoints[dataPoints.length - 1]?.amount || 1;

  const FREQS = [{ v: '1', l: 'Annually' }, { v: '4', l: 'Quarterly' }, { v: '12', l: 'Monthly' }, { v: '365', l: 'Daily' }];

  return (
    <ToolLayout tool={tool} instructions="Enter principal, rate, and time to calculate compound interest.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Principal ($)</label>
          <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Annual Rate (%)</label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Years</label>
          <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Compound Frequency</label>
          <div className="flex gap-1">
            {FREQS.map(f => (
              <Button key={f.v} variant={freq === f.v ? 'default' : 'outline'} onClick={() => setFreq(f.v)} className="flex-1 text-xs px-1 h-9">{f.l}</Button>
            ))}
          </div>
        </div>
      </div>
      {valid && (
        <div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Final Amount', value: `$${finalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
              { label: 'Total Interest', value: `$${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
              { label: 'Return', value: `${((totalInterest / p) * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <div className="text-sm text-muted-foreground mb-1">{label}</div>
                <div className="text-xl font-bold text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground mb-2">Growth over time</div>
            {dataPoints.filter((_, i) => i % Math.max(1, Math.floor(dataPoints.length / 10)) === 0 || i === dataPoints.length - 1).map(({ year, amount }) => (
              <div key={year} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-muted-foreground">Year {year}</span>
                <div className="flex-1 bg-muted/20 rounded-full h-4 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(amount / maxAmount) * 100}%` }} />
                </div>
                <span className="w-28 text-right font-mono text-xs">${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
