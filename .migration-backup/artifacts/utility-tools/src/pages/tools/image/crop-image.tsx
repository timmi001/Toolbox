import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CropImage() {
  const tool = getToolBySlug('crop-image')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const image = new Image();
      image.onload = () => {
        setImg({ url, w: image.width, h: image.height, name: file.name });
        setCrop({ x: 0, y: 0, w: image.width, h: image.height });
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  }

  function download() {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = crop.w; canvas.height = crop.h;
    const ctx = canvas.getContext('2d')!;
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'cropped_' + img.name; a.click();
    };
    image.src = img.url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image and enter crop coordinates. Preview the crop, then download.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-2">✂️</div>
          <div className="font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          <div className="relative inline-block mb-4 mx-auto block">
            <img src={img.url} className="max-h-48 max-w-full object-contain rounded-lg" alt="Original" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {['x', 'y', 'w', 'h'].map((field) => (
              <div key={field}>
                <label className="text-sm text-muted-foreground mb-1 block">{field === 'x' ? 'Left (X)' : field === 'y' ? 'Top (Y)' : field === 'w' ? 'Width' : 'Height'} (px)</label>
                <Input type="number" min={0} max={field === 'x' || field === 'w' ? img.w : img.h} value={crop[field as keyof typeof crop]}
                  onChange={(e) => setCrop(prev => ({ ...prev, [field]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground mb-4">Image size: {img.w} × {img.h}px | Crop: {crop.w} × {crop.h}px at ({crop.x}, {crop.y})</div>
          <div className="flex gap-2">
            <Button onClick={download}>Download Cropped</Button>
            <Button variant="outline" onClick={() => setCrop({ x: 0, y: 0, w: img.w, h: img.h })}>Reset Crop</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
