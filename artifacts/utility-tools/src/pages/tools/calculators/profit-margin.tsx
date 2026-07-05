import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

export default function ProfitMargin() {
  const tool = getToolBySlug('profit-margin')!;
  const [cost, setCost] = useState('50');
  const [revenue, setRevenue] = useState('100');

  const c = parseFloat(cost), r = parseFloat(revenue);
  const profit = r - c;
  const margin = (profit / r) * 100;
  const markup = (profit / c) * 100;
  const valid = !isNaN(c) && !isNaN(r) && c > 0 && r > 0;

  return (
    <ToolLayout tool={tool} instructions="Enter cost and revenue to calculate profit margin and markup percentage.">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Cost ($)</label>
          <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="50" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Revenue / Selling Price ($)</label>
          <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="100" />
        </div>
      </div>
      {valid && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Gross Profit', value: `$${profit.toFixed(2)}`, color: profit >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'Profit Margin', value: `${margin.toFixed(2)}%`, color: 'text-primary' },
            { label: 'Markup', value: `${markup.toFixed(2)}%`, color: 'text-blue-400' },
            { label: 'Cost Ratio', value: `${((c / r) * 100).toFixed(2)}%`, color: 'text-muted-foreground' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-4 bg-muted/20 rounded-xl border border-border/30">
              <div className="text-sm text-muted-foreground mb-1">{label}</div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
