import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

const categories: Record<string, { label: string; units: Record<string, { name: string; factor: number }> }> = {
  length: {
    label: 'Length',
    units: {
      m: { name: 'Meter', factor: 1 },
      km: { name: 'Kilometer', factor: 1000 },
      cm: { name: 'Centimeter', factor: 0.01 },
      mm: { name: 'Millimeter', factor: 0.001 },
      mi: { name: 'Mile', factor: 1609.344 },
      yd: { name: 'Yard', factor: 0.9144 },
      ft: { name: 'Foot', factor: 0.3048 },
      in: { name: 'Inch', factor: 0.0254 },
    }
  },
  weight: {
    label: 'Weight',
    units: {
      kg: { name: 'Kilogram', factor: 1 },
      g: { name: 'Gram', factor: 0.001 },
      lb: { name: 'Pound', factor: 0.453592 },
      oz: { name: 'Ounce', factor: 0.0283495 },
      t: { name: 'Metric Ton', factor: 1000 },
    }
  },
  temperature: {
    label: 'Temperature',
    units: {
      c: { name: 'Celsius', factor: 1 },
      f: { name: 'Fahrenheit', factor: 1 },
      k: { name: 'Kelvin', factor: 1 },
    }
  },
  area: {
    label: 'Area',
    units: {
      'm2': { name: 'Square Meter', factor: 1 },
      'km2': { name: 'Square Kilometer', factor: 1e6 },
      'cm2': { name: 'Square Centimeter', factor: 0.0001 },
      'ft2': { name: 'Square Foot', factor: 0.092903 },
      'ac': { name: 'Acre', factor: 4046.86 },
      'ha': { name: 'Hectare', factor: 10000 },
    }
  },
};

function convert(value: number, from: string, to: string, cat: string): number {
  if (cat === 'temperature') {
    let celsius = from === 'f' ? (value - 32) / 1.8 : from === 'k' ? value - 273.15 : value;
    return to === 'f' ? celsius * 1.8 + 32 : to === 'k' ? celsius + 273.15 : celsius;
  }
  const units = categories[cat].units;
  return (value * units[from].factor) / units[to].factor;
}

export default function UnitConverter() {
  const tool = getToolBySlug('unit-converter')!;
  const [cat, setCat] = useState('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [value, setValue] = useState('1');

  const units = Object.entries(categories[cat].units);
  const result = value && !isNaN(parseFloat(value)) ? convert(parseFloat(value), from, to, cat) : null;

  return (
    <ToolLayout tool={tool} instructions="Select a category, then choose units and enter a value to convert.">
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(categories).map(([key, { label }]) => (
          <button key={key} onClick={() => { setCat(key); setFrom(Object.keys(categories[key].units)[0]); setTo(Object.keys(categories[key].units)[1]); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${cat === key ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'}`}>{label}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6 items-end">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {units.map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Value</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {units.map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}
          </select>
        </div>
      </div>
      {result !== null && (
        <div className="text-center p-6 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">{value} {categories[cat].units[from]?.name} =</div>
          <div className="text-4xl font-extrabold text-primary">{result.toPrecision(8).replace(/\.?0+$/, '')}</div>
          <div className="text-muted-foreground mt-1">{categories[cat].units[to]?.name}</div>
        </div>
      )}
    </ToolLayout>
  );
}
