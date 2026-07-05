import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function BlurImage() {
  const tool = getToolBySlug('blur-image')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [blur, setBlur] = useState(5);
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
    ctx.filter = `blur(${blur}px)`;
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'blurred_' + img.name; a.click();
    };
    image.src = img.url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image and adjust the blur intensity slider.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-2">🌫️</div>
          <div className="font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          <div className="flex justify-center mb-4">
            <img src={img.url} className="max-h-48 max-w-full object-contain rounded-lg" style={{ filter: `blur(${blur}px)` }} alt="Preview" />
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Blur Intensity</span><span>{blur}px</span>
            </div>
            <Slider min={0} max={30} value={[blur]} onValueChange={([v]) => setBlur(v)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={download}>Download</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
