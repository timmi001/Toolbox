import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RotateImage() {
  const tool = getToolBySlug('rotate-image')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [angle, setAngle] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const image = new Image();
      image.onload = () => setImg({ url, w: image.width, h: image.height, name: file.name });
      image.src = url;
    };
    reader.readAsDataURL(file);
  }

  function download() {
    if (!img) return;
    const rad = (angle * Math.PI) / 180;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const c = angle % 180 !== 0 ? img.h : img.w;
      const r = angle % 180 !== 0 ? img.w : img.h;
      canvas.width = c; canvas.height = r;
      const ctx = canvas.getContext('2d')!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(image, -img.w / 2, -img.h / 2);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'rotated_' + img.name;
      a.click();
    };
    image.src = img.url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image, choose rotation angle, then download.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-3">🔄</div>
          <div className="text-lg font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          <div className="flex justify-center mb-6">
            <img src={img.url} className="max-h-48 max-w-full object-contain rounded-lg" style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.3s' }} alt="Preview" />
          </div>
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {[90, 180, 270, 45, -45].map(a => (
              <Button key={a} variant="outline" onClick={() => setAngle((angle + a + 360) % 360)}>{a > 0 ? '+' : ''}{a}°</Button>
            ))}
          </div>
          <div className="flex gap-2 items-center mb-6">
            <label className="text-sm text-muted-foreground w-24">Custom angle</label>
            <Input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value) % 360)} className="w-32" />
            <span className="text-muted-foreground">°</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={download}>Download Rotated</Button>
            <Button variant="outline" onClick={() => setAngle(0)}>Reset</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
