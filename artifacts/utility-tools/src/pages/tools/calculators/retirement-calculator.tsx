import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

export default function RetirementCalculator() {
  const tool = getToolBySlug('retirement-calculator')!;
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('65');
  const [savings, setSavings] = useState('50000');
  const [monthly, setMonthly] = useState('500');
  const [returnRate, setReturnRate] = useState('7');
  const [withdrawRate, setWithdrawRate] = useState('4');

  const age = parseInt(currentAge) || 30;
  const retire = parseInt(retireAge) || 65;
  const pv = parseFloat(savings) || 0;
  const pmt = parseFloat(monthly) || 0;
  const r = parseFloat(returnRate) / 100 / 12;
  const n = Math.max(0, (retire - age)) * 12;
  const wr = parseFloat(withdrawRate) / 100;

  // FV of lump sum + FV of annuity
  const fvLump = r > 0 ? pv * Math.pow(1 + r, n) : pv;
  const fvAnnuity = r > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) : pmt * n;
  const total = fvLump + fvAnnuity;
  const monthlyIncome = (total * wr) / 12;

  const milestones = [0.25, 0.5, 0.75, 1].map(f => {
    const yrs = Math.round(f * (retire - age));
    const months = yrs * 12;
    const fv = (r > 0 ? pv * Math.pow(1+r,months) : pv) + (r > 0 ? pmt*((Math.pow(1+r,months)-1)/r) : pmt*months);
    return { age: age + yrs, amount: fv };
  });

  return (
    <ToolLayout tool={tool} instructions="Project how much you'll have at retirement and the monthly income it could generate.">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Current Age', val: currentAge, set: setCurrentAge },
          { label: 'Retirement Age', val: retireAge, set: setRetireAge },
          { label: 'Current Savings ($)', val: savings, set: setSavings },
          { label: 'Monthly Contribution ($)', val: monthly, set: setMonthly },
          { label: 'Annual Return (%)', val: returnRate, set: setReturnRate },
          { label: 'Withdrawal Rate (%)', val: withdrawRate, set: setWithdrawRate },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
            <Input type="number" min={0} value={val} onChange={e => set(e.target.value)} />
          </div>
        ))}
      </div>

      {retire > age && (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {[
              { label: `Projected savings at age ${retire}`, value: `$${total.toLocaleString('en-US',{maximumFractionDigits:0})}`, hi: true },
              { label: `Monthly income (${withdrawRate}% rule)`, value: `$${monthlyIncome.toLocaleString('en-US',{maximumFractionDigits:0})}/mo`, hi: true },
              { label: 'Years until retirement', value: `${retire - age} years` },
              { label: 'Total contributions', value: `$${(pmt * n).toLocaleString('en-US',{maximumFractionDigits:0})}` },
            ].map(({ label, value, hi }) => (
              <div key={label} className={`text-center p-4 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${hi ? 'text-primary' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium mb-2">Savings milestones</p>
          <div className="space-y-2">
            {milestones.map(({ age: a, amount }) => (
              <div key={a} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-muted-foreground">Age {a}</span>
                <div className="flex-1 bg-muted/20 rounded h-4">
                  <div className="bg-primary h-full rounded" style={{ width: `${(amount / total) * 100}%` }} />
                </div>
                <span className="w-28 text-right font-mono text-xs">${amount.toLocaleString('en-US',{maximumFractionDigits:0})}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
