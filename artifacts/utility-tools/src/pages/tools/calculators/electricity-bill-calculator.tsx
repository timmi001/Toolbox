import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Appliance { id: number; name: string; watts: string; hours: string; days: string; }
let aid = 10;

const DEFAULTS: Appliance[] = [
  { id: 1, name: 'Air Conditioner', watts: '1500', hours: '8', days: '30' },
  { id: 2, name: 'Refrigerator', watts: '150', hours: '24', days: '30' },
  { id: 3, name: 'TV (LED)', watts: '100', hours: '5', days: '30' },
  { id: 4, name: 'Washing Machine', watts: '500', hours: '1', days: '15' },
  { id: 5, name: 'Laptop', watts: '65', hours: '8', days: '30' },
];

export default function ElectricityBillCalculator() {
  const tool = getToolBySlug('electricity-bill-calculator')!;
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULTS);
  const [rate, setRate] = useState('0.15'); // $/kWh

  function add() { setAppliances(a => [...a, { id: ++aid, name: '', watts: '', hours: '', days: '30' }]); }
  function remove(id: number) { setAppliances(a => a.filter(x => x.id !== id)); }
  function update(id: number, key: keyof Appliance, val: string) {
    setAppliances(a => a.map(x => x.id === id ? { ...x, [key]: val } : x));
  }

  const rateVal = parseFloat(rate) || 0.15;

  const rows = appliances.map(a => {
    const w = parseFloat(a.watts) || 0;
    const h = parseFloat(a.hours) || 0;
    const d = parseFloat(a.days) || 0;
    const kwh = (w * h * d) / 1000;
    const cost = kwh * rateVal;
    return { ...a, kwh, cost };
  });

  const totalKwh = rows.reduce((s, r) => s + r.kwh, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const maxCost = Math.max(...rows.map(r => r.cost), 1);

  return (
    <ToolLayout tool={tool} instructions="Add your appliances and usage to estimate your monthly electricity bill.">
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm text-muted-foreground shrink-0">Electricity rate ($/kWh)</label>
        <Input type="number" min={0} step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="w-32" />
      </div>

      {/* Appliance table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {['Appliance', 'Watts', 'Hrs/day', 'Days/mo', 'kWh/mo', 'Cost/mo', ''].map(h => (
                <th key={h} className="text-left px-2 py-1.5 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-muted/20">
                <td className="px-2 py-1.5"><Input value={row.name} onChange={e => update(row.id,'name',e.target.value)} className="h-7 text-xs w-32" placeholder="Appliance" /></td>
                {(['watts','hours','days'] as const).map(k => (
                  <td key={k} className="px-2 py-1.5"><Input type="number" min={0} value={row[k]} onChange={e => update(row.id,k,e.target.value)} className="h-7 text-xs w-20" /></td>
                ))}
                <td className="px-2 py-1.5 font-mono text-xs">{row.kwh.toFixed(1)}</td>
                <td className="px-2 py-1.5 font-medium text-xs">${row.cost.toFixed(2)}</td>
                <td className="px-2 py-1.5">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => remove(row.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={add} className="mb-5 text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" /> Add appliance
      </Button>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total kWh / month', value: `${totalKwh.toFixed(1)} kWh` },
          { label: 'Estimated monthly bill', value: `$${totalCost.toFixed(2)}`, hi: true },
          { label: 'Daily average', value: `$${(totalCost/30).toFixed(2)}/day` },
          { label: 'Annual estimate', value: `$${(totalCost*12).toFixed(2)}/year` },
        ].map(({ label, value, hi }) => (
          <div key={label} className={`text-center p-3 rounded-xl border ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className={`text-lg font-bold ${hi ? 'text-primary' : ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Cost breakdown bar */}
      <p className="text-sm font-medium mb-2">Cost breakdown</p>
      <div className="space-y-1">
        {rows.filter(r => r.cost > 0).sort((a,b) => b.cost - a.cost).map(r => (
          <div key={r.id} className="flex items-center gap-2 text-xs">
            <span className="w-32 truncate text-muted-foreground">{r.name || 'Unnamed'}</span>
            <div className="flex-1 bg-muted/20 rounded h-3">
              <div className="bg-primary h-full rounded" style={{ width: `${(r.cost/maxCost)*100}%` }} />
            </div>
            <span className="w-14 text-right font-mono">${r.cost.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
