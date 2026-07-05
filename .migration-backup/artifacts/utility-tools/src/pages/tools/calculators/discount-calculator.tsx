import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

export default function DiscountCalculator() {
  const tool = getToolBySlug('discount-calculator')!;
  const { currencyCode, formatCurrency } = useCurrencyPreference();
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('20');

  const orig = parseFloat(price);
  const disc = parseFloat(discount);
  const saved = (orig * disc) / 100;
  const final = orig - saved;
  const valid = !isNaN(orig) && !isNaN(disc) && orig > 0 && disc >= 0 && disc <= 100;

  return (
    <ToolLayout tool={tool} instructions="Enter the original price and discount percentage to see the final price.">
      <CurrencySelector className="mb-6" />
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Original Price ({currencyCode})</label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Discount (%)</label>
          <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" min="0" max="100" />
        </div>
      </div>
      {valid && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/20 rounded-xl border border-border/30">
            <div className="text-sm text-muted-foreground mb-1">Original Price</div>
            <div className="text-2xl font-bold line-through text-muted-foreground">{formatCurrency(orig)}</div>
          </div>
          <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="text-sm text-green-400 mb-1">You Save</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(saved)}</div>
          </div>
          <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="text-sm text-muted-foreground mb-1">Final Price</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(final)}</div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
