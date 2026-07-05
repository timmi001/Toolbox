import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function ImageCompressor() {
  const tool = getToolBySlug('image-compressor')!;
  const [quality, setQuality] = useState(80);
  const [original, setOriginal] = useState<{ url: string; size: number; name: string } | null>(null);
  const [compressed, setCompressed] = useState<{ url: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginal({ url, size: file.size, name: file.name });
      compress(url, quality, file.type);
    };
    reader.readAsDataURL(file);
  }

  function compress(url: string, q: number, type: string) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      const mime = type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mime, q / 100);
      const bytes = Math.round((dataUrl.length - 22) * 3 / 4);
      setCompressed({ url: dataUrl, size: bytes });
    };
    img.src = url;
  }

  function handleQuality(q: number) {
    setQuality(q);
    if (original) compress(original.url, q, original.url.includes('png') ? 'image/png' : 'image/jpeg');
  }

  function download() {
    if (!compressed || !original) return;
    const a = document.createElement('a');
    a.href = compressed.url;
    a.download = 'compressed_' + original.name;
    a.click();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an image, adjust quality, then download the compressed version.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {!original ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-3">📁</div>
          <div className="text-lg font-medium mb-1">Drop image here or click to upload</div>
          <div className="text-sm text-muted-foreground">JPG, PNG, WebP supported</div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Quality</span><span className="text-foreground font-medium">{quality}%</span>
            </div>
            <Slider min={10} max={100} value={[quality]} onValueChange={([v]) => handleQuality(v)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <img src={original.url} className="max-h-48 mx-auto rounded-lg mb-2 object-contain" alt="Original" />
              <div className="text-sm font-medium">Original</div>
              <div className="text-sm text-muted-foreground">{formatSize(original.size)}</div>
            </div>
            {compressed && (
              <div className="text-center">
                <img src={compressed.url} className="max-h-48 mx-auto rounded-lg mb-2 object-contain" alt="Compressed" />
                <div className="text-sm font-medium">Compressed</div>
                <div className="text-sm text-primary">{formatSize(compressed.size)}</div>
                <div className="text-xs text-green-400 mt-1">
                  {((1 - compressed.size / original.size) * 100).toFixed(1)}% smaller
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={download} disabled={!compressed}>Download</Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()}>Change Image</Button>
            <Button variant="outline" onClick={() => { setOriginal(null); setCompressed(null); }}>Reset</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
