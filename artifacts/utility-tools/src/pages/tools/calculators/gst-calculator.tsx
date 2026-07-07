import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PRESETS = [
  { country: 'Australia', rate: 10, label: '10% GST' },
  { country: 'New Zealand', rate: 15, label: '15% GST' },
  { country: 'Canada', rate: 5, label: '5% GST' },
  { country: 'India (standard)', rate: 18, label: '18% GST' },
  { country: 'India (lower)', rate: 12, label: '12% GST' },
  { country: 'Singapore', rate: 9, label: '9% GST' },
  { country: 'UK (VAT)', rate: 20, label: '20% VAT' },
  { country: 'EU (VAT)', rate: 21, label: '21% VAT' },
  { country: 'Custom', rate: 0, label: 'Custom' },
];

export default function GstCalculator() {
  const tool = getToolBySlug('gst-calculator')!;
  const [amount, setAmount] = useState('1000');
  const [rateStr, setRateStr] = useState('10');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [preset, setPreset] = useState(0);

  function applyPreset(i: number) {
    setPreset(i);
    if (PRESETS[i].rate > 0) setRateStr(String(PRESETS[i].rate));
  }

  const a = parseFloat(amount) || 0;
  const rate = parseFloat(rateStr) || 0;

  const gstAmount = mode === 'add' ? a * (rate / 100) : a - a / (1 + rate / 100);
  const total = mode === 'add' ? a + gstAmount : a;
  const original = mode === 'add' ? a : a / (1 + rate / 100);

  return (
    <ToolLayout tool={tool} instructions="Enter an amount and GST rate to add or remove tax from a price.">
      <div className="flex gap-2 mb-5">
        <Button variant={mode === 'add' ? 'default' : 'outline'} onClick={() => setMode('add')} className="flex-1">Add GST to price</Button>
        <Button variant={mode === 'remove' ? 'default' : 'outline'} onClick={() => setMode('remove')} className="flex-1">Remove GST from price</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">{mode === 'add' ? 'Original price (ex-GST)' : 'GST-inclusive price'}</label>
          <Input type="number" min={0} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">GST Rate (%)</label>
          <Input type="number" min={0} max={100} step="0.1" value={rateStr} onChange={e => { setRateStr(e.target.value); setPreset(8); }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((p, i) => (
          <Button key={p.country} size="sm" variant={preset === i ? 'default' : 'outline'} onClick={() => applyPreset(i)} className="text-xs">{p.label}</Button>
        ))}
      </div>

      {a > 0 && rate > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: mode === 'add' ? 'Original Price' : 'Price ex-GST', value: `$${original.toFixed(2)}` },
            { label: 'GST Amount', value: `$${gstAmount.toFixed(2)}` },
            { label: mode === 'add' ? 'Total (incl. GST)' : 'You entered', value: `$${total.toFixed(2)}`, hi: true },
          ].map(({ label, value, hi }) => (
            <div key={label} className={`text-center p-4 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-xl font-bold ${hi ? 'text-primary' : ''}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
