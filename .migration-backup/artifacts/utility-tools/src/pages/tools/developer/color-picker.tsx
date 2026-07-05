import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPicker() {
  const tool = getToolBySlug('color-picker')!;
  const [color, setColor] = useState('#00A86B');
  const [history, setHistory] = useState<string[]>(['#00A86B']);
  const [copied, setCopied] = useState('');

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  function handleChange(c: string) {
    setColor(c);
    setHistory(prev => [c, ...prev.filter(h => h !== c)].slice(0, 12));
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const formats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  return (
    <ToolLayout tool={tool} instructions="Use the color picker to select a color and get HEX, RGB, and HSL values.">
      <div className="flex flex-col items-center mb-6 gap-4">
        <input type="color" value={color} onChange={(e) => handleChange(e.target.value)} className="w-48 h-48 rounded-2xl cursor-pointer border-4 border-border shadow-2xl" style={{ padding: 0 }} />
        <div className="h-16 w-full rounded-xl border border-border/50" style={{ background: color }} />
      </div>
      <div className="space-y-3 mb-6">
        {formats.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
            <span className="text-sm text-muted-foreground w-12">{label}</span>
            <span className="flex-1 font-mono text-sm">{value}</span>
            <Button variant="ghost" size="sm" onClick={() => copy(value, label)}>{copied === label ? 'Copied!' : 'Copy'}</Button>
          </div>
        ))}
      </div>
      {history.length > 1 && (
        <div>
          <div className="text-sm text-muted-foreground mb-2">Color History</div>
          <div className="flex gap-2 flex-wrap">
            {history.map((c, i) => (
              <button key={i} onClick={() => setColor(c)} title={c} className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: c === color ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
