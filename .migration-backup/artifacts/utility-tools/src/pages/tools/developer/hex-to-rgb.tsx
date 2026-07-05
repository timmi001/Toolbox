import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
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

export default function HexToRgb() {
  const tool = getToolBySlug('hex-to-rgb')!;
  const [hex, setHex] = useState('#00A86B');
  const [copied, setCopied] = useState('');

  const isValid = /^#[0-9A-Fa-f]{6}$/.test(hex);
  const rgb = isValid ? hexToRgb(hex) : null;
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Enter a HEX color code to convert it to RGB and HSL formats.">
      <div className="flex gap-3 mb-6 items-end">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">HEX Color</label>
          <div className="flex gap-2">
            <input type="color" value={isValid ? hex : '#000000'} onChange={(e) => setHex(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border bg-transparent" />
            <Input value={hex} onChange={(e) => setHex(e.target.value)} className="font-mono" placeholder="#00A86B" maxLength={7} />
          </div>
        </div>
      </div>
      {rgb && hsl ? (
        <div className="space-y-4">
          <div className="h-24 rounded-xl border border-border/50" style={{ background: hex }} />
          {[
            { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
            { label: 'R', value: String(rgb.r) },
            { label: 'G', value: String(rgb.g) },
            { label: 'B', value: String(rgb.b) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground w-12">{label}</span>
              <span className="flex-1 font-mono text-sm">{value}</span>
              <Button variant="ghost" size="sm" onClick={() => copy(value, label)}>{copied === label ? 'Copied!' : 'Copy'}</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Enter a valid 6-digit hex color (e.g. #00A86B)</div>
      )}
    </ToolLayout>
  );
}
