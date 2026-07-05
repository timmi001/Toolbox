import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function CssBoxShadowGenerator() {
  const tool = getToolBySlug('css-box-shadow-generator')!;
  const [offsetX, setOffsetX] = useState(8);
  const [offsetY, setOffsetY] = useState(8);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#4f46e5');
  const [opacity, setOpacity] = useState(35);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const boxShadow = useMemo(() => {
    const normalizedColor = color + Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
    return `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${normalizedColor}`;
  }, [offsetX, offsetY, blur, spread, color, opacity, inset]);

  const copyCss = async () => {
    await navigator.clipboard.writeText(`box-shadow: ${boxShadow};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Adjust the shadow values and copy the generated CSS for your card, button, or panel styling.">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border border-border/50 bg-background shadow-[var(--shadow-preview)]" style={{ ['--shadow-preview' as string]: boxShadow }}>
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/90 to-secondary/80" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3">
            <span className="font-mono text-sm">box-shadow: {boxShadow};</span>
            <Button size="sm" variant="outline" onClick={copyCss}>{copied ? 'Copied!' : 'Copy CSS'}</Button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          {[
            { label: 'Horizontal offset', value: offsetX, setValue: setOffsetX, min: -50, max: 50 },
            { label: 'Vertical offset', value: offsetY, setValue: setOffsetY, min: -50, max: 50 },
            { label: 'Blur radius', value: blur, setValue: setBlur, min: 0, max: 100 },
            { label: 'Spread radius', value: spread, setValue: setSpread, min: -30, max: 30 },
            { label: 'Opacity', value: opacity, setValue: setOpacity, min: 0, max: 100 },
          ].map((field) => (
            <label key={field.label} className="block text-sm">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-medium text-foreground">{field.value}</span>
              </div>
              <input type="range" min={field.min} max={field.max} value={field.value} onChange={(e) => field.setValue(Number(e.target.value))} className="w-full accent-primary" />
            </label>
          ))}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
            Inset shadow
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Shadow color</span>
            <div className="flex gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-border/50 bg-transparent" />
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
          </label>
        </div>
      </div>
    </ToolLayout>
  );
}
