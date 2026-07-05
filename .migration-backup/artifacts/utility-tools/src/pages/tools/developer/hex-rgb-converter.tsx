import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  if (/^[0-9a-f]{6}$/i.test(value)) {
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return { r, g, b };
  }
  return { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export default function HexRgbConverter() {
  const tool = getToolBySlug('hex-rgb-converter')!;
  const [hex, setHex] = useState('#2563EB');
  const [r, setR] = useState(37);
  const [g, setG] = useState(99);
  const [b, setB] = useState(235);

  const convertedHex = useMemo(() => rgbToHex(r, g, b), [r, g, b]);
  const convertedRgb = useMemo(() => hexToRgb(hex), [hex]);

  const applyHex = () => {
    setR(convertedRgb.r);
    setG(convertedRgb.g);
    setB(convertedRgb.b);
  };

  const applyRgb = () => {
    setHex(convertedHex);
  };

  return (
    <ToolLayout tool={tool} instructions="Enter either a HEX color or RGB values to convert between formats instantly.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">HEX color</span>
            <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
          </label>
          <Button onClick={applyHex}>Convert HEX to RGB</Button>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 font-mono text-sm">RGB: {convertedRgb.r}, {convertedRgb.g}, {convertedRgb.b}</div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex gap-3">
            {[
              { label: 'R', value: r, setValue: setR },
              { label: 'G', value: g, setValue: setG },
              { label: 'B', value: b, setValue: setB },
            ].map((field) => (
              <label key={field.label} className="flex-1 text-sm">
                <span className="mb-1 block text-muted-foreground">{field.label}</span>
                <input type="range" min="0" max="255" value={field.value} onChange={(e) => field.setValue(Number(e.target.value))} className="w-full accent-primary" />
                <div className="mt-1 text-center font-medium">{field.value}</div>
              </label>
            ))}
          </div>
          <Button onClick={applyRgb}>Convert RGB to HEX</Button>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 font-mono text-sm">HEX: {convertedHex}</div>
        </div>
      </div>
    </ToolLayout>
  );
}
