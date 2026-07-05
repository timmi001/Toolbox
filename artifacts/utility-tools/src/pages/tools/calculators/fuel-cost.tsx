import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

export default function FuelCost() {
  const tool = getToolBySlug('fuel-cost')!;
  const { currencyCode, formatCurrency } = useCurrencyPreference();
  const [distance, setDistance] = useState('500');
  const [efficiency, setEfficiency] = useState('30');
  const [price, setPrice] = useState('3.50');

  const d = parseFloat(distance), e = parseFloat(efficiency), p = parseFloat(price);
  const valid = !isNaN(d) && !isNaN(e) && !isNaN(p) && e > 0;
  const gallons = d / e;
  const total = gallons * p;

  return (
    <ToolLayout tool={tool} instructions="Enter trip distance, vehicle fuel efficiency, and fuel price to estimate total fuel cost.">
      <CurrencySelector className="mb-6" />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Distance (miles)</label>
          <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Fuel Efficiency (MPG)</label>
          <Input type="number" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Fuel Price ($/gallon)</label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" />
        </div>
      </div>
      {valid && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Fuel Needed', value: `${gallons.toFixed(2)} gallons` },
            { label: 'Total Cost', value: formatCurrency(total) },
            { label: 'Cost per Mile', value: formatCurrency(total / d) },
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
