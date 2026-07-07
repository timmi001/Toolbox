import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ACTIVITY = [
  { label: 'Sedentary', desc: 'Little/no exercise', factor: 1.2 },
  { label: 'Light', desc: '1–3 days/week', factor: 1.375 },
  { label: 'Moderate', desc: '3–5 days/week', factor: 1.55 },
  { label: 'Active', desc: '6–7 days/week', factor: 1.725 },
  { label: 'Very Active', desc: 'Hard daily exercise', factor: 1.9 },
];

const GOALS = [
  { label: 'Lose weight fast', delta: -1000 },
  { label: 'Lose weight', delta: -500 },
  { label: 'Maintain weight', delta: 0 },
  { label: 'Gain muscle', delta: 250 },
  { label: 'Bulk up', delta: 500 },
];

export default function CalorieCalculator() {
  const tool = getToolBySlug('calorie-calculator')!;
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [activity, setActivity] = useState(1);

  const a = parseInt(age) || 25;
  const wKg = unit === 'metric' ? (parseFloat(weight) || 0) : (parseFloat(weight) || 0) * 0.453592;
  const hCm = unit === 'metric' ? (parseFloat(height) || 0) : ((parseInt(heightFt) || 0) * 12 + (parseInt(heightIn) || 0)) * 2.54;

  // Mifflin-St Jeor
  const bmr = gender === 'male'
    ? 10 * wKg + 6.25 * hCm - 5 * a + 5
    : 10 * wKg + 6.25 * hCm - 5 * a - 161;
  const tdee = bmr * ACTIVITY[activity].factor;

  const valid = wKg > 0 && hCm > 0 && a > 0;

  return (
    <ToolLayout tool={tool} instructions="Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).">
      {/* Gender + Units */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>Male</Button>
        <Button variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>Female</Button>
        <div className="ml-auto flex gap-2">
          <Button variant={unit === 'metric' ? 'default' : 'outline'} onClick={() => setUnit('metric')}>Metric</Button>
          <Button variant={unit === 'imperial' ? 'default' : 'outline'} onClick={() => setUnit('imperial')}>Imperial</Button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Age</label>
          <Input type="number" min={1} max={120} value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <Input type="number" min={0} value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Height ({unit === 'metric' ? 'cm' : 'ft/in'})</label>
          {unit === 'metric'
            ? <Input type="number" min={0} value={height} onChange={e => setHeight(e.target.value)} />
            : <div className="flex gap-2">
                <Input type="number" min={0} placeholder="ft" value={heightFt} onChange={e => setHeightFt(e.target.value)} />
                <Input type="number" min={0} max={11} placeholder="in" value={heightIn} onChange={e => setHeightIn(e.target.value)} />
              </div>
          }
        </div>
      </div>

      {/* Activity */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Activity level</label>
        <div className="grid grid-cols-5 gap-2">
          {ACTIVITY.map((a, i) => (
            <button key={a.label} onClick={() => setActivity(i)}
              className={`p-2 rounded-lg border text-xs text-center transition-colors ${activity === i ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-muted/20 hover:bg-muted/40'}`}>
              <div>{a.label}</div>
              <div className="text-muted-foreground leading-tight">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {valid && (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: 'BMR (Basal Metabolic Rate)', value: `${Math.round(bmr)} cal/day`, sub: 'Calories burned at complete rest', hi: false },
              { label: 'TDEE (Maintenance calories)', value: `${Math.round(tdee)} cal/day`, sub: `With ${ACTIVITY[activity].label.toLowerCase()} activity`, hi: true },
            ].map(({ label, value, sub, hi }) => (
              <div key={label} className={`p-4 rounded-xl border text-center ${hi ? 'bg-primary/10 border-primary/30' : 'bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`text-2xl font-extrabold ${hi ? 'text-primary' : ''}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium mb-2">Calories by goal</p>
          <div className="space-y-2">
            {GOALS.map(({ label, delta }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-lg border bg-muted/20 text-sm">
                <span>{label}</span>
                <span className="font-bold font-mono">{Math.round(tdee + delta).toLocaleString()} cal/day</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
