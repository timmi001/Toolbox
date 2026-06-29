import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export default function DominantColor() {
  const tool = getToolBySlug('dominant-color')!;
  const [colors, setColors] = useState<string[]>([]);
  const [imgUrl, setImgUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const SAMPLE = 100;
      canvas.width = SAMPLE; canvas.height = SAMPLE;
      canvas.getContext('2d')!.drawImage(img, 0, 0, SAMPLE, SAMPLE);
      const data = canvas.getContext('2d')!.getImageData(0, 0, SAMPLE, SAMPLE).data;

      // Simple clustering: bucket into 8x8x8 bins
      const bins: Record<string, { r: number; g: number; b: number; count: number }> = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        if (!bins[key]) bins[key] = { r, g, b, count: 0 };
        bins[key].count++;
      }
      const top = Object.values(bins).sort((a, b) => b.count - a.count).slice(0, 8);
      setColors(top.map(c => toHex(Math.min(255, c.r), Math.min(255, c.g), Math.min(255, c.b))));
    };
    img.src = url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image to extract its dominant colors.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🎨</div>
        <div className="font-medium">Click to upload image</div>
      </div>
      {imgUrl && <img src={imgUrl} className="max-h-40 mx-auto rounded-lg mb-4 object-contain" alt="Uploaded" />}
      {colors.length > 0 && (
        <div>
          <div className="text-sm text-muted-foreground mb-3">Dominant Colors</div>
          <div className="flex gap-3 flex-wrap">
            {colors.map((hex) => (
              <div key={hex} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigator.clipboard.writeText(hex)}>
                <div className="w-16 h-16 rounded-xl border border-border/50 shadow-md hover:scale-110 transition-transform" style={{ background: hex }} />
                <span className="text-xs font-mono text-muted-foreground">{hex.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Click a color to copy its HEX value</p>
        </div>
      )}
    </ToolLayout>
  );
}
