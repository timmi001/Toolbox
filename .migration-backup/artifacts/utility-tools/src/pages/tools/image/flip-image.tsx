import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function FlipImage() {
  const tool = getToolBySlug('flip-image')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
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
    const canvas = document.createElement('canvas');
    canvas.width = img.w; canvas.height = img.h;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, flipH ? -img.w : 0, flipV ? -img.h : 0, img.w, img.h);
      ctx.restore();
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'flipped_' + img.name;
      a.click();
    };
    image.src = img.url;
  }

  const transform = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;

  return (
    <ToolLayout tool={tool} instructions="Upload an image, flip it horizontally or vertically, then download.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-3">🪞</div>
          <div className="text-lg font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          <div className="flex justify-center mb-6">
            <img src={img.url} className="max-h-48 max-w-full object-contain rounded-lg" style={{ transform, transition: 'transform 0.3s' }} alt="Preview" />
          </div>
          <div className="flex gap-4 justify-center mb-6">
            <Button variant={flipH ? 'default' : 'outline'} onClick={() => setFlipH(!flipH)}>Flip Horizontal</Button>
            <Button variant={flipV ? 'default' : 'outline'} onClick={() => setFlipV(!flipV)}>Flip Vertical</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={download}>Download Flipped</Button>
            <Button variant="outline" onClick={() => { setFlipH(false); setFlipV(false); }}>Reset</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
