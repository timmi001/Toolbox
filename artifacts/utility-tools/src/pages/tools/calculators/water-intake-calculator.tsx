import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', factor: 1.0, desc: 'Mostly sitting, no exercise' },
  { label: 'Light', factor: 1.15, desc: 'Light exercise 1–3 days/week' },
  { label: 'Moderate', factor: 1.3, desc: 'Moderate exercise 3–5 days/week' },
  { label: 'Active', factor: 1.45, desc: 'Hard exercise 6–7 days/week' },
  { label: 'Very Active', factor: 1.6, desc: 'Physical job or intense training' },
];
const CLIMATES = [
  { label: 'Cool / Temperate', extra: 0 },
  { label: 'Warm', extra: 0.35 },
  { label: 'Hot / Humid', extra: 0.7 },
];

export default function WaterIntakeCalculator() {
  const tool = getToolBySlug('water-intake-calculator')!;
  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [activity, setActivity] = useState(1);
  const [climate, setClimate] = useState(0);

  const w = parseFloat(weight) || 0;
  const wKg = unit === 'kg' ? w : w * 0.453592;
  const base = wKg * 0.033; // 33 ml / kg baseline
  const actFactor = ACTIVITY_LEVELS[activity].factor;
  const climateExtra = CLIMATES[climate].extra;
  const liters = base * actFactor + climateExtra;
  const cups = liters / 0.2366; // 1 cup = 236.6 ml
  const glasses = liters / 0.25; // 250 ml glass

  const pct = Math.min((liters / 4) * 100, 100);

  return (
    <ToolLayout tool={tool} instructions="Calculate your recommended daily water intake based on your weight and lifestyle.">
      {/* Weight */}
      <div className="mb-5">
        <label className="text-sm text-muted-foreground mb-2 block">Your weight</label>
        <div className="flex gap-2">
          <Input type="number" min={1} value={weight} onChange={e => setWeight(e.target.value)} className="flex-1" />
          <Button variant={unit === 'kg' ? 'default' : 'outline'} onClick={() => setUnit('kg')}>kg</Button>
          <Button variant={unit === 'lbs' ? 'default' : 'outline'} onClick={() => setUnit('lbs')}>lbs</Button>
        </div>
      </div>

      {/* Activity */}
      <div className="mb-5">
        <label className="text-sm text-muted-foreground mb-2 block">Activity level</label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {ACTIVITY_LEVELS.map((a, i) => (
            <button
              key={a.label}
              onClick={() => setActivity(i)}
              className={`p-2 rounded-lg border text-xs text-left transition-colors ${activity === i ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/20 hover:bg-muted/40'}`}
            >
              <div className="font-semibold">{a.label}</div>
              <div className="text-muted-foreground mt-0.5 leading-tight">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Climate */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">Climate / environment</label>
        <div className="flex gap-2">
          {CLIMATES.map((c, i) => (
            <Button key={c.label} variant={climate === i ? 'default' : 'outline'} onClick={() => setClimate(i)} className="flex-1 text-xs">{c.label}</Button>
          ))}
        </div>
      </div>

      {wKg > 0 && (
        <>
          {/* Visual gauge */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-500"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-blue-500">{liters.toFixed(1)}L</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-blue-500">{liters.toFixed(1)} litres / day</p>
              <p className="text-muted-foreground text-sm">{glasses.toFixed(0)} glasses (250 ml) per day</p>
              <p className="text-muted-foreground text-sm">{cups.toFixed(0)} cups (240 ml) per day</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Morning', value: `${(liters * 0.3).toFixed(2)} L`, desc: 'On waking + breakfast' },
              { label: 'Afternoon', value: `${(liters * 0.4).toFixed(2)} L`, desc: 'During work / activity' },
              { label: 'Evening', value: `${(liters * 0.3).toFixed(2)} L`, desc: 'Dinner + before bed' },
            ].map(({ label, value, desc }) => (
              <div key={label} className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-blue-500">{value}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolLayout>
  );
}
