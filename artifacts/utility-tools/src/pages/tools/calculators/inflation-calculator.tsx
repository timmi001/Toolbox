import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

const currentYear = new Date().getFullYear();

export default function InflationCalculator() {
  const tool = getToolBySlug('inflation-calculator')!;
  const [amount, setAmount] = useState('1000');
  const [startYear, setStartYear] = useState('2000');
  const [endYear, setEndYear] = useState(String(currentYear));
  const [rate, setRate] = useState('3');

  const a = parseFloat(amount) || 0;
  const sy = parseInt(startYear) || 2000;
  const ey = parseInt(endYear) || currentYear;
  const r = parseFloat(rate) / 100 || 0.03;
  const years = Math.max(0, ey - sy);
  const futureValue = a * Math.pow(1 + r, years);
  const purchasingPower = a / Math.pow(1 + r, years); // value of $a in start-year dollars at end
  const totalInflation = ((futureValue - a) / a) * 100;

  const dataPoints = Array.from({ length: Math.min(years + 1, 21) }, (_, i) => {
    const stepYears = years <= 20 ? i : Math.round(i * years / 20);
    return {
      year: sy + stepYears,
      value: a * Math.pow(1 + r, stepYears),
    };
  });
  const maxVal = dataPoints[dataPoints.length - 1]?.value || 1;

  return (
    <ToolLayout tool={tool} instructions="See how inflation erodes purchasing power over time.">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Original Amount ($)</label>
          <Input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Annual Inflation Rate (%)</label>
          <Input type="number" min={0} max={100} step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Start Year</label>
          <Input type="number" min={1900} max={currentYear + 100} value={startYear} onChange={e => setStartYear(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">End Year</label>
          <Input type="number" min={1900} max={currentYear + 100} value={endYear} onChange={e => setEndYear(e.target.value)} />
        </div>
      </div>

      {a > 0 && years > 0 && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: `$${a.toLocaleString()} in ${sy} equals`, value: `$${futureValue.toLocaleString('en-US',{maximumFractionDigits:2})} in ${ey}`, hi: true },
              { label: 'Total inflation', value: `${totalInflation.toFixed(1)}%` },
              { label: `Purchasing power in ${ey}`, value: `$${purchasingPower.toLocaleString('en-US',{maximumFractionDigits:2})}` },
            ].map(({ label, value, hi }) => (
              <div key={label} className={`text-center p-4 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-lg font-bold ${hi ? 'text-primary' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium mb-2">Value over time (nominal)</p>
          <div className="space-y-1">
            {dataPoints.map(({ year, value }) => (
              <div key={year} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-muted-foreground text-right">{year}</span>
                <div className="flex-1 bg-muted/20 rounded h-4">
                  <div className="bg-primary h-full rounded" style={{ width: `${(value / maxVal) * 100}%` }} />
                </div>
                <span className="w-28 text-right font-mono text-xs">${value.toLocaleString('en-US',{maximumFractionDigits:0})}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
