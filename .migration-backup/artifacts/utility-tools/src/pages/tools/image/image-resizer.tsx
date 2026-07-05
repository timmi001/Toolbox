import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ImageResizer() {
  const tool = getToolBySlug('image-resizer')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const image = new Image();
      image.onload = () => {
        setImg({ url, w: image.width, h: image.height, name: file.name });
        setW(image.width); setH(image.height);
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  }

  function handleW(val: number) {
    setW(val);
    if (keepAspect && img) setH(Math.round(val * img.h / img.w));
  }

  function handleH(val: number) {
    setH(val);
    if (keepAspect && img) setW(Math.round(val * img.w / img.h));
  }

  function download() {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const image = new Image();
    image.onload = () => {
      canvas.getContext('2d')!.drawImage(image, 0, 0, w, h);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'resized_' + img.name;
      a.click();
    };
    image.src = img.url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image, enter new dimensions, then download.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-3">🖼️</div>
          <div className="text-lg font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          <img src={img.url} className="max-h-48 mx-auto rounded-lg mb-6 object-contain block" alt="Preview" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Width (px)</label>
              <Input type="number" value={w} onChange={(e) => handleW(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Height (px)</label>
              <Input type="number" value={h} onChange={(e) => handleH(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="aspect" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="accent-primary" />
            <label htmlFor="aspect" className="text-sm text-muted-foreground cursor-pointer">Maintain aspect ratio</label>
          </div>
          <div className="text-sm text-muted-foreground mb-4">Original: {img.w} × {img.h}px → New: {w} × {h}px</div>
          <div className="flex gap-2">
            <Button onClick={download}>Download Resized</Button>
            <Button variant="outline" onClick={() => { setW(img.w); setH(img.h); }}>Reset Size</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
