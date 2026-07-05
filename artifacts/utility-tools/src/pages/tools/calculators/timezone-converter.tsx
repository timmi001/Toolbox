import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';

const ZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo',
];

export default function TimezoneConverter() {
  const tool = getToolBySlug('timezone-converter')!;
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const [datetime, setDatetime] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
  const [from, setFrom] = useState('UTC');
  const [selected, setSelected] = useState<string[]>(['America/New_York', 'Europe/London', 'Asia/Tokyo']);

  function getConverted(zone: string) {
    try {
      const d = new Date(datetime);
      if (isNaN(d.getTime())) return 'Invalid';
      return d.toLocaleString('en-US', { timeZone: zone, hour12: false, year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Error'; }
  }

  function toggleZone(zone: string) {
    setSelected(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]);
  }

  return (
    <ToolLayout tool={tool} instructions="Enter a date/time, select zones to compare. Toggle zones in the list below.">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Date & Time</label>
          <Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Input Timezone</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[from, ...selected.filter(z => z !== from)].map(zone => (
          <div key={zone} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border border-border/30">
            <span className="text-sm text-muted-foreground w-48 shrink-0">{zone}</span>
            <span className="font-mono text-sm">{getConverted(zone)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ZONES.filter(z => z !== from).map(zone => (
          <button key={zone} onClick={() => toggleZone(zone)} className={`text-xs px-2 py-1 rounded border transition-colors ${selected.includes(zone) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/20 border-border/30 hover:border-primary/50'}`}>{zone}</button>
        ))}
      </div>
    </ToolLayout>
  );
}
