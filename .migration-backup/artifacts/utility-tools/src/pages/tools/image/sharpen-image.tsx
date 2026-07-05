import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
  const result = new Uint8ClampedArray(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            val += data[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        result[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, val));
      }
    }
  }
  imageData.data.set(result);
  ctx.putImageData(imageData, 0, 0);
}

export default function SharpenImage() {
  const tool = getToolBySlug('sharpen-image')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [amount, setAmount] = useState(0.3);
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function processImage(url: string, w: number, h: number, a: number): Promise<string> {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        applySharpen(ctx, w, h, a);
        resolve(canvas.toDataURL('image/png'));
      };
      image.src = url;
    });
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      const image = new Image();
      image.onload = async () => {
        const p = await processImage(url, image.width, image.height, amount);
        setImg({ url, w: image.width, h: image.height, name: file.name });
        setPreview(p);
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  }

  async function handleAmount(a: number) {
    setAmount(a);
    if (img) setPreview(await processImage(img.url, img.w, img.h, a));
  }

  function download() {
    if (!preview || !img) return;
    const a = document.createElement('a');
    a.href = preview; a.download = 'sharpened_' + img.name; a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image and adjust sharpness. The preview updates in real-time.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-2">✨</div>
          <div className="font-medium">Click to upload image</div>
        </div>
      ) : (
        <div>
          {preview && <img src={preview} className="max-h-48 max-w-full object-contain rounded-lg mx-auto block mb-4" alt="Preview" />}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Sharpen Amount</span><span>{amount.toFixed(2)}</span>
            </div>
            <Slider min={0} max={1} step={0.05} value={[amount]} onValueChange={([v]) => handleAmount(v)} />
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
