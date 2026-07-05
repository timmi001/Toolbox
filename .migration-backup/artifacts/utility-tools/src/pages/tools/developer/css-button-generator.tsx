import { useMemo, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function CssButtonGenerator() {
  const tool = getToolBySlug('css-button-generator')!;
  const [bg, setBg] = useState('#2563eb');
  const [text, setText] = useState('#ffffff');
  const [paddingY, setPaddingY] = useState(12);
  const [paddingX, setPaddingX] = useState(20);
  const [radius, setRadius] = useState(999);
  const [borderWidth, setBorderWidth] = useState(0);
  const [shadow, setShadow] = useState(20);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => `button {
  background: ${bg};
  color: ${text};
  border: ${borderWidth}px solid ${bg};
  padding: ${paddingY}px ${paddingX}px;
  border-radius: ${radius}px;
  box-shadow: 0 ${shadow}px 24px rgba(0, 0, 0, 0.16);
}

button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}`,
  [bg, text, paddingY, paddingX, radius, borderWidth, shadow]);

  const copyCss = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool} instructions="Tweak the button properties and copy the generated CSS for your interface.">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
          <div className="flex min-h-[180px] items-center justify-center">
            <button className="font-semibold transition-all duration-200" style={{ background: bg, color: text, padding: `${paddingY}px ${paddingX}px`, borderRadius: `${radius}px`, border: `${borderWidth}px solid ${bg}`, boxShadow: `0 ${shadow}px 24px rgba(0,0,0,0.16)` }}>
              Preview Button
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-4">
          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Background</span>
              <span className="font-medium text-foreground">{bg}</span>
            </div>
            <div className="flex gap-3">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-border/50 bg-transparent" />
              <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Text</span>
              <span className="font-medium text-foreground">{text}</span>
            </div>
            <div className="flex gap-3">
              <input type="color" value={text} onChange={(e) => setText(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-border/50 bg-transparent" />
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Padding Y</span>
              <span className="font-medium text-foreground">{paddingY}</span>
            </div>
            <input type="range" min={6} max={24} value={paddingY} onChange={(e) => setPaddingY(Number(e.target.value))} className="w-full accent-primary" />
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Padding X</span>
              <span className="font-medium text-foreground">{paddingX}</span>
            </div>
            <input type="range" min={10} max={32} value={paddingX} onChange={(e) => setPaddingX(Number(e.target.value))} className="w-full accent-primary" />
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Radius</span>
              <span className="font-medium text-foreground">{radius}</span>
            </div>
            <input type="range" min={0} max={999} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary" />
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Border width</span>
              <span className="font-medium text-foreground">{borderWidth}</span>
            </div>
            <input type="range" min={0} max={6} value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} className="w-full accent-primary" />
          </label>

          <label className="block text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground">Shadow depth</span>
              <span className="font-medium text-foreground">{shadow}</span>
            </div>
            <input type="range" min={0} max={40} value={shadow} onChange={(e) => setShadow(Number(e.target.value))} className="w-full accent-primary" />
          </label>

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3">
            <span className="font-mono text-xs">Generated CSS</span>
            <Button size="sm" variant="outline" onClick={copyCss}>{copied ? 'Copied!' : 'Copy CSS'}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs leading-6">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
