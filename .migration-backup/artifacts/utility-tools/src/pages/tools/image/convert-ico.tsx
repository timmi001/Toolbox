import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function ConvertIco() {
  const tool = getToolBySlug('convert-ico')!;
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const sizes = [16, 32, 48, 64];
        const ps = sizes.map(size => {
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
    a.href = url; a.download = `icon-${size}x${size}.png`; a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PNG or JPG to generate ICO-compatible sizes. Download as PNG files in icon sizes.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">Click to upload PNG or JPG</div>
      </div>
      {previews.length > 0 && (
        <div>
          <div className="text-sm text-muted-foreground mb-4">Generated icon sizes:</div>
          <div className="flex gap-6 flex-wrap mb-4">
            {previews.map(({ size, url }) => (
              <div key={size} className="text-center">
                <div className="border border-border/50 rounded-lg p-2 bg-white mb-2 inline-block">
                  <img src={url} width={size} height={size} alt={`${size}px`} />
                </div>
                <div className="text-xs text-muted-foreground">{size}×{size}px</div>
                <Button variant="ghost" size="sm" className="text-xs mt-1" onClick={() => download(url, size)}>Download</Button>
              </div>
            ))}
          </div>
          <Button onClick={() => previews.forEach(({ url, size }) => download(url, size))} className="w-full">Download All</Button>
        </div>
      )}
    </ToolLayout>
  );
}
