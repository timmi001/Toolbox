import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RACES = [
  { name: '1 km', km: 1 }, { name: '1 mile', km: 1.60934 }, { name: '5K', km: 5 },
  { name: '10K', km: 10 }, { name: 'Half Marathon', km: 21.0975 }, { name: 'Marathon', km: 42.195 },
];

function toSeconds(h: string, m: string, s: string) {
  return (parseInt(h)||0)*3600 + (parseInt(m)||0)*60 + (parseInt(s)||0);
}
function fromSeconds(total: number) {
  const h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = Math.round(total%60);
  return { h, m, s, fmt: h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}` };
}

export default function PaceCalculator() {
  const tool = getToolBySlug('pace-calculator')!;
  const [mode, setMode] = useState<'pace' | 'time' | 'distance'>('pace');
  const [distKm, setDistKm] = useState('10');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [th, setTh] = useState('0'); const [tm, setTm] = useState('55'); const [ts, setTs] = useState('0');
  const [ph, setPh] = useState('0'); const [pm, setPm] = useState('5'); const [ps, setPs] = useState('30');

  const distMi = parseFloat(distKm) / 1.60934;
  const displayDist = unit === 'km' ? parseFloat(distKm) : distMi;
  const totalSec = toSeconds(th, tm, ts);
  const paceSec = toSeconds(ph, pm, ps);
  const distanceKm = parseFloat(distKm) || 0;

  // Calculate the unknown based on mode
  let calcPace = fromSeconds(0), calcTime = fromSeconds(0), calcDist = 0;
  if (mode === 'pace' && distanceKm > 0 && totalSec > 0) {
    const pacePerKm = totalSec / distanceKm;
    calcPace = fromSeconds(unit === 'km' ? pacePerKm : pacePerKm * 1.60934);
  }
  if (mode === 'time' && distanceKm > 0 && paceSec > 0) {
    const paceKm = unit === 'km' ? paceSec : paceSec / 1.60934;
    calcTime = fromSeconds(distanceKm * paceKm);
  }
  if (mode === 'distance' && totalSec > 0 && paceSec > 0) {
    const paceKm = unit === 'km' ? paceSec : paceSec / 1.60934;
    calcDist = totalSec / paceKm;
  }

  // Race finish times (from current pace or time/dist)
  const paceKmSec = mode === 'pace' ? (calcPace.h*3600+calcPace.m*60+calcPace.s) : (unit === 'km' ? paceSec : paceSec/1.60934);

  return (
    <ToolLayout tool={tool} instructions="Calculate your running pace, time, or distance. Two inputs → one output.">
      <div className="flex gap-2 mb-5">
        {(['pace','time','distance'] as const).map(m => (
          <Button key={m} variant={mode === m ? 'default' : 'outline'} onClick={() => setMode(m)} className="flex-1 capitalize">
            Calculate {m}
          </Button>
        ))}
      </div>
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Button size="sm" variant={unit === 'km' ? 'default' : 'outline'} onClick={() => setUnit('km')}>km</Button>
          <Button size="sm" variant={unit === 'mi' ? 'default' : 'outline'} onClick={() => setUnit('mi')}>miles</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        {/* Distance */}
        <div className={mode === 'distance' ? 'opacity-50 pointer-events-none' : ''}>
          <label className="text-sm text-muted-foreground mb-2 block">Distance ({unit})</label>
          <Input type="number" min={0} step="0.1" value={displayDist.toFixed(3).replace(/\.?0+$/, '')}
            onChange={e => setDistKm(unit === 'km' ? e.target.value : String(parseFloat(e.target.value)*1.60934))} />
          <div className="flex flex-wrap gap-1 mt-2">
            {RACES.map(r => (
              <button key={r.name} onClick={() => setDistKm(String(r.km))}
                className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-primary/20 hover:text-primary transition-colors">{r.name}</button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className={mode === 'time' ? 'opacity-50 pointer-events-none' : ''}>
          <label className="text-sm text-muted-foreground mb-2 block">Time (h : m : s)</label>
          <div className="flex gap-1">
            <Input type="number" min={0} placeholder="0" value={th} onChange={e => setTh(e.target.value)} className="text-center" />
            <Input type="number" min={0} max={59} placeholder="00" value={tm} onChange={e => setTm(e.target.value)} className="text-center" />
            <Input type="number" min={0} max={59} placeholder="00" value={ts} onChange={e => setTs(e.target.value)} className="text-center" />
          </div>
        </div>

        {/* Pace */}
        <div className={mode === 'pace' ? 'opacity-50 pointer-events-none' : ''}>
          <label className="text-sm text-muted-foreground mb-2 block">Pace (min : sec / {unit})</label>
          <div className="flex gap-1">
            <Input type="number" min={0} placeholder="0" value={ph} onChange={e => setPh(e.target.value)} className="text-center" />
            <Input type="number" min={0} max={59} placeholder="00" value={pm} onChange={e => setPm(e.target.value)} className="text-center" />
            <Input type="number" min={0} max={59} placeholder="00" value={ps} onChange={e => setPs(e.target.value)} className="text-center" />
          </div>
        </div>
      </div>

      {/* Result */}
      {((mode === 'pace' && calcPace.m + calcPace.h > 0) ||
        (mode === 'time' && calcTime.m + calcTime.h + calcTime.s > 0) ||
        (mode === 'distance' && calcDist > 0)) && (
        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/30 text-center mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {mode === 'pace' ? `Pace per ${unit}` : mode === 'time' ? 'Finish Time' : `Distance (${unit})`}
          </p>
          <p className="text-4xl font-extrabold text-primary">
            {mode === 'pace' ? calcPace.fmt : mode === 'time' ? calcTime.fmt : (unit === 'km' ? calcDist.toFixed(2) : (calcDist/1.60934).toFixed(2))}
          </p>
        </div>
      )}

      {/* Race projections */}
      {paceKmSec > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Race finish time projections</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RACES.map(r => {
              const secs = r.km * paceKmSec;
              const t = fromSeconds(secs);
              return (
                <div key={r.name} className="p-3 rounded-lg border bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                  <p className="font-bold font-mono">{t.fmt}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
