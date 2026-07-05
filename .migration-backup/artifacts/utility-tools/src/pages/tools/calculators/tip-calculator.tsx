import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function TipCalculator() {
  const tool = getToolBySlug('tip-calculator')!;
  const [bill, setBill] = useState('50');
  const [tip, setTip] = useState(18);
  const [people, setPeople] = useState('2');

  const b = parseFloat(bill), n = parseFloat(people) || 1;
  const tipAmt = (b * tip) / 100;
  const total = b + tipAmt;
  const perPerson = total / n;
  const tipPerPerson = tipAmt / n;

  return (
    <ToolLayout tool={tool} instructions="Enter your bill total, choose tip percentage, and split between people.">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Bill Total ($)</label>
          <Input type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="50.00" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Number of People</label>
          <Input type="number" value={people} onChange={(e) => setPeople(e.target.value)} min="1" />
        </div>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Tip Percentage</span><span className="text-foreground font-bold text-lg">{tip}%</span>
        </div>
        <div className="flex gap-2 mb-3">
          {[10, 15, 18, 20, 25].map(t => (
            <Button key={t} variant={tip === t ? 'default' : 'outline'} onClick={() => setTip(t)} className="flex-1 text-sm">{t}%</Button>
          ))}
        </div>
        <Slider min={0} max={50} value={[tip]} onValueChange={([v]) => setTip(v)} />
      </div>
      {!isNaN(b) && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Tip Amount', value: `$${tipAmt.toFixed(2)}` },
            { label: 'Total Bill', value: `$${total.toFixed(2)}` },
            { label: 'Tip per Person', value: `$${tipPerPerson.toFixed(2)}` },
            { label: 'Total per Person', value: `$${perPerson.toFixed(2)}` },
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
