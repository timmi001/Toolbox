import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function VatCalculator() {
  const tool = getToolBySlug('vat-calculator')!;
  const [amount, setAmount] = useState('100');
  const [vatRate, setVatRate] = useState('20');
  const [mode, setMode] = useState<'add' | 'remove'>('add');

  const a = parseFloat(amount), v = parseFloat(vatRate);
  const valid = !isNaN(a) && !isNaN(v) && a > 0 && v >= 0;
  const vatAmount = mode === 'add' ? (a * v) / 100 : a - a / (1 + v / 100);
  const total = mode === 'add' ? a + vatAmount : a;
  const net = mode === 'add' ? a : a / (1 + v / 100);

  return (
    <ToolLayout tool={tool} instructions="Enter an amount and VAT rate to calculate the tax amount.">
      <div className="flex gap-2 mb-4">
        <Button variant={mode === 'add' ? 'default' : 'outline'} onClick={() => setMode('add')} className="flex-1">Add VAT</Button>
        <Button variant={mode === 'remove' ? 'default' : 'outline'} onClick={() => setMode('remove')} className="flex-1">Remove VAT</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">{mode === 'add' ? 'Net Amount (ex. VAT)' : 'Gross Amount (inc. VAT)'} ($)</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">VAT Rate (%)</label>
          <div className="flex gap-2">
            {['5', '10', '20', '25'].map(r => (
              <Button key={r} variant={vatRate === r ? 'default' : 'outline'} onClick={() => setVatRate(r)} className="flex-1">{r}%</Button>
            ))}
          </div>
          <Input type="number" value={vatRate} onChange={(e) => setVatRate(e.target.value)} className="mt-2" placeholder="Custom %" />
        </div>
      </div>
      {valid && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Net (ex. VAT)', value: `$${net.toFixed(2)}` },
            { label: `VAT (${v}%)`, value: `$${vatAmount.toFixed(2)}` },
            { label: 'Gross (inc. VAT)', value: `$${total.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="text-sm text-muted-foreground mb-1">{label}</div>
              <div className="text-2xl font-bold text-primary">{value}</div>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
