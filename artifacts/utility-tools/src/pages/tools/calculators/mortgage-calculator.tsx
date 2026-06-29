import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MortgageCalculator() {
  const tool = getToolBySlug('mortgage-calculator')!;
  const [home, setHome] = useState('350000');
  const [down, setDown] = useState('70000');
  const [rate, setRate] = useState('7');
  const [term, setTerm] = useState('30');

  const principal = parseFloat(home) - parseFloat(down);
  const r = parseFloat(rate) / 100 / 12;
  const n = parseFloat(term) * 12;
  const valid = principal > 0 && !isNaN(r) && !isNaN(n) && n > 0;
  const monthly = valid && r > 0 ? principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : valid ? principal / n : 0;
  const total = monthly * n;

  return (
    <ToolLayout tool={tool} instructions="Enter home price, down payment, interest rate, and loan term.">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Home Price ($)</label>
          <Input type="number" value={home} onChange={(e) => setHome(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Down Payment ($)</label>
          <Input type="number" value={down} onChange={(e) => setDown(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Annual Rate (%)</label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Loan Term</label>
          <div className="flex gap-2">
            {['15', '20', '30'].map(t => (
              <Button key={t} variant={term === t ? 'default' : 'outline'} onClick={() => setTerm(t)} className="flex-1">{t} yr</Button>
            ))}
          </div>
        </div>
      </div>
      {valid && (
        <div>
          <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl mb-4">
            <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
            <div className="text-5xl font-extrabold text-primary">${monthly.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground mt-2">Loan: ${principal.toLocaleString()}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Paid', value: `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
              { label: 'Total Interest', value: `$${(total - principal).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
              { label: 'Down %', value: `${((parseFloat(down) / parseFloat(home)) * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 bg-muted/20 rounded-xl border border-border/30">
                <div className="text-sm text-muted-foreground mb-1">{label}</div>
                <div className="text-xl font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
