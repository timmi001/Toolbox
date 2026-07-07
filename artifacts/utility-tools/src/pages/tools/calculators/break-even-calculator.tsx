import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

export default function BreakEvenCalculator() {
  const tool = getToolBySlug('break-even-calculator')!;
  const [fixed, setFixed] = useState('10000');
  const [variable, setVariable] = useState('25');
  const [price, setPrice] = useState('50');

  const fc = parseFloat(fixed) || 0;
  const vc = parseFloat(variable) || 0;
  const sp = parseFloat(price) || 0;
  const cm = sp - vc; // contribution margin per unit
  const valid = cm > 0;
  const bepUnits = valid ? fc / cm : 0;
  const bepRevenue = bepUnits * sp;
  const marginRatio = valid ? (cm / sp) * 100 : 0;

  const volumes = valid ? [0.5, 0.75, 1, 1.25, 1.5, 2].map(mult => {
    const units = Math.round(bepUnits * mult);
    const revenue = units * sp;
    const totalCost = fc + units * vc;
    const profit = revenue - totalCost;
    return { units, revenue, profit };
  }) : [];

  const maxProfit = Math.max(...volumes.map(v => Math.abs(v.profit)), 1);

  return (
    <ToolLayout tool={tool} instructions="Enter your costs and selling price to find the break-even point.">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Fixed Costs ($)', val: fixed, set: setFixed, hint: 'Rent, salaries, insurance…' },
          { label: 'Variable Cost per Unit ($)', val: variable, set: setVariable, hint: 'Materials, labour per unit…' },
          { label: 'Selling Price per Unit ($)', val: price, set: setPrice, hint: 'What you charge customers' },
        ].map(({ label, val, set, hint }) => (
          <div key={label}>
            <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
            <Input type="number" min={0} step="0.01" value={val} onChange={e => set(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          </div>
        ))}
      </div>

      {!valid && cm <= 0 && (sp > 0 || vc > 0) && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm mb-4">
          Selling price must be greater than variable cost per unit.
        </div>
      )}

      {valid && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Break-even Units', value: Math.ceil(bepUnits).toLocaleString(), hi: true },
              { label: 'Break-even Revenue', value: `$${bepRevenue.toLocaleString('en-US',{maximumFractionDigits:2})}` },
              { label: 'Contribution Margin', value: `${marginRatio.toFixed(1)}% ($${cm.toFixed(2)}/unit)` },
            ].map(({ label, value, hi }) => (
              <div key={label} className={`text-center p-4 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${hi ? 'text-primary' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium mb-3">Profit / loss at different volumes</p>
          <div className="space-y-2">
            {volumes.map(({ units, profit }) => {
              const isProfit = profit >= 0;
              const pct = Math.abs(profit) / maxProfit * 100;
              return (
                <div key={units} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-muted-foreground text-right">{units.toLocaleString()} units</span>
                  <div className="flex-1 bg-muted/20 rounded h-5 overflow-hidden">
                    <div className={`h-full rounded transition-all ${isProfit ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-28 text-right font-mono text-xs font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isProfit ? '+' : ''}${profit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
