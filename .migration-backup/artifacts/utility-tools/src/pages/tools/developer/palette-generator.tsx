import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

function randomColorFromHue(hue: number) {
  const sat = 70 + Math.floor(Math.random() * 20);
  const light = 45 + Math.floor(Math.random() * 20);
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export default function PaletteGenerator() {
  const tool = getToolBySlug('palette-generator')!;
  const [count, setCount] = useState(5);
  const [hue, setHue] = useState(220);
  const [palette, setPalette] = useState<string[]>([]);

  useMemo(() => {
    setPalette(Array.from({ length: count }, () => randomColorFromHue(hue)));
  }, [count, hue]);

  const refresh = () => setPalette(Array.from({ length: count }, () => randomColorFromHue(hue)));

  return (
    <ToolLayout tool={tool} instructions="Generate a fresh color palette for your design system, landing page, or brand concept.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Palette size</span>
            <input type="range" min="3" max="8" value={count} onChange={(e) => setCount(Number(e.target.value))} className="accent-primary" />
            <div className="mt-1 text-sm font-medium">{count} colors</div>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Base hue</span>
            <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(Number(e.target.value))} className="accent-primary" />
            <div className="mt-1 text-sm font-medium">{hue}°</div>
          </label>
          <Button onClick={refresh}>Generate</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {palette.map((color, index) => (
            <div key={`${color}-${index}`} className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
              <div className="h-24" style={{ background: color }} />
              <div className="p-3">
                <div className="text-sm font-medium">Color {index + 1}</div>
                <div className="font-mono text-xs text-muted-foreground">{color}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
