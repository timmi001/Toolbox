import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

export default function LoanCalculator() {
  const tool = getToolBySlug('loan-calculator')!;
  const [amount, setAmount] = useState('20000');
  const [rate, setRate] = useState('6');
  const [term, setTerm] = useState('60');

  const p = parseFloat(amount), r = parseFloat(rate) / 100 / 12, n = parseFloat(term);
  const valid = !isNaN(p) && !isNaN(r) && !isNaN(n) && p > 0 && n > 0;
  const monthly = valid && r > 0 ? p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : valid ? p / n : 0;
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - p;

  return (
    <ToolLayout tool={tool} instructions="Enter loan amount, annual interest rate, and term in months to calculate monthly payment.">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Loan Amount ($)</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Annual Rate (%)</label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Term (months)</label>
          <Input type="number" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
      </div>
      {valid && (
        <div>
          <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl mb-4">
            <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
            <div className="text-5xl font-extrabold text-primary">${monthly.toFixed(2)}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Amount Paid', value: `$${totalPaid.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
              { label: 'Total Interest', value: `$${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
              { label: 'Interest Ratio', value: `${((totalInterest / totalPaid) * 100).toFixed(1)}%` },
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
