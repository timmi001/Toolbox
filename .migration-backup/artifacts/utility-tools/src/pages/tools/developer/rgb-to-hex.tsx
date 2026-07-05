import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function RgbToHex() {
  const tool = getToolBySlug('rgb-to-hex')!;
  const [r, setR] = useState(0);
  const [g, setG] = useState(168);
  const [b, setB] = useState(107);
  const [copied, setCopied] = useState(false);

  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

  function copy() {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sliders = [
    { label: 'R', value: r, set: setR, color: 'bg-red-500' },
    { label: 'G', value: g, set: setG, color: 'bg-green-500' },
    { label: 'B', value: b, set: setB, color: 'bg-blue-500' },
  ];

  return (
    <ToolLayout tool={tool} instructions="Adjust RGB sliders or enter values to convert to HEX.">
      <div className="h-24 rounded-xl border border-border/50 mb-6" style={{ background: `rgb(${r},${g},${b})` }} />
      <div className="space-y-4 mb-6">
        {sliders.map(({ label, value, set }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="w-4 font-bold text-sm">{label}</span>
            <Slider min={0} max={255} value={[value]} onValueChange={([v]) => set(v)} className="flex-1" />
            <Input type="number" min={0} max={255} value={value} onChange={(e) => set(Math.min(255, Math.max(0, Number(e.target.value))))} className="w-16 font-mono text-center" />
          </div>
        ))}
      </div>
      <div className="p-4 bg-muted/30 border border-border/50 rounded-lg mb-4 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">HEX</span>
        <span className="font-mono text-2xl font-bold text-primary">{hex.toUpperCase()}</span>
      </div>
      <Button onClick={copy} className="w-full">{copied ? 'Copied!' : `Copy ${hex.toUpperCase()}`}</Button>
    </ToolLayout>
  );
}
