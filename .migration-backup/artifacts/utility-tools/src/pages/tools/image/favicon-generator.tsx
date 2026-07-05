import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

const SIZES = [16, 32, 48, 64, 128, 256];

export default function FaviconGenerator() {
  const tool = getToolBySlug('favicon-generator')!;
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [origUrl, setOrigUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOrigUrl(url);
      const img = new Image();
      img.onload = () => {
        const ps = SIZES.map(size => {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = size;
          canvas.getContext('2d')!.drawImage(img, 0, 0, size, size);
          return { size, url: canvas.toDataURL('image/png') };
        });
        setPreviews(ps);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function download(url: string, size: number) {
    const a = document.createElement('a');
    a.href = url; a.download = `favicon-${size}x${size}.png`; a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Upload any image to generate favicon PNGs in all standard sizes.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6">
        <div className="text-4xl mb-2">🏴</div>
        <div className="font-medium">Click to upload image (PNG, JPG, SVG)</div>
      </div>
      {origUrl && (
        <div>
          <img src={origUrl} className="w-32 h-32 object-contain mx-auto rounded-lg border border-border/50 mb-6" alt="Original" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {previews.map(({ size, url }) => (
              <div key={size} className="text-center">
                <div className="bg-checkerboard rounded-lg mb-1 p-1 border border-border/30 flex items-center justify-center" style={{ background: '#ffffff' }}>
                  <img src={url} width={size > 64 ? 64 : size} height={size > 64 ? 64 : size} alt={`${size}px`} className="block" />
                </div>
                <div className="text-xs text-muted-foreground">{size}×{size}</div>
                <Button variant="ghost" size="sm" className="text-xs h-7 mt-1" onClick={() => download(url, size)}>Save</Button>
              </div>
            ))}
          </div>
          <Button onClick={() => previews.forEach(({ url, size }) => { setTimeout(() => download(url, size), size * 5); })} className="w-full">Download All Sizes</Button>
        </div>
      )}
    </ToolLayout>
  );
}
