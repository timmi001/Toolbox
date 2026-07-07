import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FEE_RATES = [
  { label: 'PayPal (Standard)', pct: 3.49, fixed: 0.49 },
  { label: 'PayPal (Friends & Family)', pct: 0, fixed: 0 },
  { label: 'PayPal (Micropayments)', pct: 4.99, fixed: 0.09 },
  { label: 'PayPal (Invoicing)', pct: 3.49, fixed: 0.49 },
  { label: 'Stripe (Standard)', pct: 2.9, fixed: 0.30 },
  { label: 'Square (Online)', pct: 2.9, fixed: 0.30 },
];

export default function PaypalFeeCalculator() {
  const tool = getToolBySlug('paypal-fee-calculator')!;
  const [amount, setAmount] = useState('100');
  const [rateIdx, setRateIdx] = useState(0);
  const [mode, setMode] = useState<'charge' | 'receive'>('charge');

  const rate = FEE_RATES[rateIdx];
  const a = parseFloat(amount) || 0;

  let fee = 0, receive = 0, chargeAmount = 0;
  if (mode === 'charge') {
    fee = a * (rate.pct / 100) + rate.fixed;
    receive = a - fee;
    chargeAmount = a;
  } else {
    // Solve: receive = charge - charge*pct - fixed → charge = (receive + fixed) / (1 - pct)
    chargeAmount = (a + rate.fixed) / (1 - rate.pct / 100);
    fee = chargeAmount - a;
    receive = a;
  }

  const stat = (label: string, value: string, highlight = false) => (
    <div key={label} className={`text-center p-4 rounded-xl border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );

  return (
    <ToolLayout tool={tool} instructions="Enter an amount to calculate PayPal fees and how much you'll actually receive.">
      {/* Mode */}
      <div className="flex gap-2 mb-5">
        <Button variant={mode === 'charge' ? 'default' : 'outline'} onClick={() => setMode('charge')} className="flex-1">I'm charging</Button>
        <Button variant={mode === 'receive' ? 'default' : 'outline'} onClick={() => setMode('receive')} className="flex-1">I want to receive</Button>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">{mode === 'charge' ? 'Amount you charge ($)' : 'Amount you want to receive ($)'}</label>
        <Input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="text-lg font-semibold" />
      </div>

      {/* Fee type */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Fee type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FEE_RATES.map((r, i) => (
            <Button key={r.label} size="sm" variant={rateIdx === i ? 'default' : 'outline'} onClick={() => setRateIdx(i)} className="text-xs h-auto py-2 px-2 whitespace-normal text-center leading-tight">
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {a > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {stat('You charge', `$${chargeAmount.toFixed(2)}`)}
          {stat('PayPal fee', `$${fee.toFixed(2)} (${((fee/chargeAmount)*100).toFixed(2)}%)`, false)}
          {stat('You receive', `$${receive.toFixed(2)}`, true)}
        </div>
      )}

      {a > 0 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Rate: {rate.pct}% + ${rate.fixed.toFixed(2)} per transaction
        </p>
      )}
    </ToolLayout>
  );
}
