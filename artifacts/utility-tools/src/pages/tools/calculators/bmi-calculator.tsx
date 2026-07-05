import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-green-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
  return { label: 'Obese', color: 'text-red-400' };
}

export default function BmiCalculator() {
  const tool = getToolBySlug('bmi-calculator')!;
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [inches, setInches] = useState('');
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
    if (unit === 'metric') {
      setResult(w / ((h / 100) ** 2));
    } else {
      const totalInches = h * 12 + (parseFloat(inches) || 0);
      setResult((703 * w) / (totalInches ** 2));
    }
  }

  const category = result ? bmiCategory(result) : null;

  return (
    <ToolLayout tool={tool} instructions="Enter your weight and height to calculate your BMI.">
      <div className="flex gap-2 mb-6">
        <Button variant={unit === 'metric' ? 'default' : 'outline'} onClick={() => { setUnit('metric'); setResult(null); }} className="flex-1">Metric (kg/cm)</Button>
        <Button variant={unit === 'imperial' ? 'default' : 'outline'} onClick={() => { setUnit('imperial'); setResult(null); }} className="flex-1">Imperial (lbs/ft)</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Height ({unit === 'metric' ? 'cm' : 'ft'})</label>
          <div className="flex gap-2">
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === 'metric' ? '175' : '5'} />
            {unit === 'imperial' && <Input type="number" value={inches} onChange={(e) => setInches(e.target.value)} placeholder="10 in" />}
          </div>
        </div>
      </div>
      <Button onClick={calculate} className="w-full mb-6">Calculate BMI</Button>
      {result && category && (
        <div className="text-center p-6 bg-muted/20 border border-border/50 rounded-xl">
          <div className="text-5xl font-extrabold text-primary mb-2">{result.toFixed(1)}</div>
          <div className={`text-xl font-semibold ${category.color}`}>{category.label}</div>
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <div>Underweight: &lt; 18.5 | Normal: 18.5–24.9 | Overweight: 25–29.9 | Obese: ≥ 30</div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
