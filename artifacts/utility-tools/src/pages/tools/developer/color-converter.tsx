import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

// ── Conversion helpers ────────────────────────────────────────────────────
function hexToRgb(hex: string): [number,number,number] | null {
  const s = hex.replace('#','');
  const n = s.length === 3 ? s.split('').map(c => parseInt(c+c, 16)) : [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
  if (n.some(isNaN)) return null;
  return n as [number,number,number];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
function rgbToHsl(r: number, g: number, b: number): [number,number,number] {
  const rn = r/255, gn = g/255, bn = b/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn), d = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (d !== 0) {
    s = d / (1 - Math.abs(2*l - 1));
    if (max === rn) h = ((gn - bn) / d + 6) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = h / 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function rgbToCmyk(r: number, g: number, b: number): [number,number,number,number] {
  const rn = r/255, gn = g/255, bn = b/255;
  const k = 1 - Math.max(rn,gn,bn);
  if (k === 1) return [0,0,0,100];
  return [Math.round((1-rn-k)/(1-k)*100), Math.round((1-gn-k)/(1-k)*100), Math.round((1-bn-k)/(1-k)*100), Math.round(k*100)];
}
function hslToRgb(h: number, s: number, l: number): [number,number,number] {
  const hn = h/360, sn = s/100, ln = l/100;
  const a = sn * Math.min(ln, 1-ln);
  const f = (n: number) => {
    const k = (n + hn*12) % 12;
    return ln - a * Math.max(-1, Math.min(k-3, 9-k, 1));
  };
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
}

type Format = 'hex' | 'rgb' | 'hsl';

export default function ColorConverter() {
  const tool = getToolBySlug('color-converter')!;
  const [format, setFormat] = useState<Format>('hex');
  const [hex, setHex] = useState('#3b82f6');
  const [rgbR, setRgbR] = useState('59');
  const [rgbG, setRgbG] = useState('130');
  const [rgbB, setRgbB] = useState('246');
  const [hslH, setHslH] = useState('217');
  const [hslS, setHslS] = useState('91');
  const [hslL, setHslL] = useState('60');
  const [copied, setCopied] = useState('');

  function syncFromHex(h: string) {
    setHex(h);
    const rgb = hexToRgb(h);
    if (!rgb) return;
    const [r,g,b] = rgb;
    setRgbR(String(r)); setRgbG(String(g)); setRgbB(String(b));
    const [hh,s,l] = rgbToHsl(r,g,b);
    setHslH(String(hh)); setHslS(String(s)); setHslL(String(l));
  }

  function syncFromRgb() {
    const [r,g,b] = [parseInt(rgbR)||0, parseInt(rgbG)||0, parseInt(rgbB)||0];
    setHex(rgbToHex(r,g,b));
    const [hh,s,l] = rgbToHsl(r,g,b);
    setHslH(String(hh)); setHslS(String(s)); setHslL(String(l));
  }

  function syncFromHsl() {
    const [r,g,b] = hslToRgb(parseInt(hslH)||0, parseInt(hslS)||0, parseInt(hslL)||0);
    setRgbR(String(r)); setRgbG(String(g)); setRgbB(String(b));
    setHex(rgbToHex(r,g,b));
  }

  const rgb = hexToRgb(hex);
  const [r,g,b] = rgb ?? [parseInt(rgbR)||0, parseInt(rgbG)||0, parseInt(rgbB)||0];
  const [hh,hs,hl] = rgbToHsl(r,g,b);
  const [c,m,y,k] = rgbToCmyk(r,g,b);

  const outputs = [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${r}, ${g}, ${b})` },
    { label: 'HSL', value: `hsl(${hh}, ${hs}%, ${hl}%)` },
    { label: 'CMYK', value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
  ];

  function copyVal(v: string) {
    navigator.clipboard.writeText(v);
    setCopied(v); setTimeout(() => setCopied(''), 2000);
  }

  return (
    <ToolLayout tool={tool} instructions="Enter a color in any format and see all conversions instantly.">
      {/* Format tabs */}
      <div className="flex gap-2 mb-4">
        {(['hex','rgb','hsl'] as Format[]).map(f => (
          <Button key={f} size="sm" variant={format === f ? 'default' : 'outline'} onClick={() => setFormat(f)} className="uppercase">{f}</Button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-14 h-14 rounded-xl border-2 border-border/50 shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1">
          {format === 'hex' && (
            <div className="flex items-center gap-2">
              <input type="color" value={hex} onChange={e => syncFromHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
              <Input value={hex} onChange={e => syncFromHex(e.target.value)} placeholder="#3b82f6" className="font-mono" />
            </div>
          )}
          {format === 'rgb' && (
            <div className="grid grid-cols-3 gap-2">
              {[['R', rgbR, setRgbR], ['G', rgbG, setRgbG], ['B', rgbB, setRgbB]].map(([label, val, setter]) => (
                <div key={label as string}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label as string} (0–255)</label>
                  <Input type="number" min={0} max={255} value={val as string}
                    onChange={e => { (setter as (v: string) => void)(e.target.value); syncFromRgb(); }} />
                </div>
              ))}
            </div>
          )}
          {format === 'hsl' && (
            <div className="grid grid-cols-3 gap-2">
              {[['H°', hslH, setHslH, 360], ['S%', hslS, setHslS, 100], ['L%', hslL, setHslL, 100]].map(([label, val, setter, max]) => (
                <div key={label as string}>
                  <label className="text-xs text-muted-foreground mb-1 block">{label as string}</label>
                  <Input type="number" min={0} max={max as number} value={val as string}
                    onChange={e => { (setter as (v: string) => void)(e.target.value); syncFromHsl(); }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output conversions */}
      <div className="grid sm:grid-cols-2 gap-3">
        {outputs.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="font-mono text-sm font-medium">{value}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => copyVal(value)}>
              <Copy className={`h-3.5 w-3.5 ${copied === value ? 'text-green-500' : ''}`} />
            </Button>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
