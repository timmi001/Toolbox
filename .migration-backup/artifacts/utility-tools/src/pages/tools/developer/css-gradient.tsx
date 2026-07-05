import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function CssGradient() {
  const tool = getToolBySlug('css-gradient')!;
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [color1, setColor1] = useState('#00A86B');
  const [color2, setColor2] = useState('#0a0a0a');
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const gradient = type === 'linear'
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : `radial-gradient(circle, ${color1}, ${color2})`;

  const css = `background: ${gradient};`;

  function copy() {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Customize colors and direction, then copy the CSS.">
      <div className="rounded-xl h-48 mb-6 transition-all" style={{ background: gradient }} />
      <div className="flex gap-2 mb-6">
        <Button variant={type === 'linear' ? 'default' : 'outline'} onClick={() => setType('linear')} className="flex-1">Linear</Button>
        <Button variant={type === 'radial' ? 'default' : 'outline'} onClick={() => setType('radial')} className="flex-1">Radial</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Color 1</label>
          <div className="flex gap-2">
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border bg-transparent" />
            <Input value={color1} onChange={(e) => setColor1(e.target.value)} className="font-mono" />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Color 2</label>
          <div className="flex gap-2">
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border bg-transparent" />
            <Input value={color2} onChange={(e) => setColor2(e.target.value)} className="font-mono" />
          </div>
        </div>
      </div>
      {type === 'linear' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Angle</span><span>{angle}°</span>
          </div>
          <Slider min={0} max={360} value={[angle]} onValueChange={([v]) => setAngle(v)} />
        </div>
      )}
      <div className="p-3 bg-muted/30 border border-border/50 rounded-lg font-mono text-sm mb-4">{css}</div>
      <Button onClick={copy} className="w-full">{copied ? 'Copied!' : 'Copy CSS'}</Button>
    </ToolLayout>
  );
}
