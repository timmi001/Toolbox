import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { convertImage, downloadDataUrl } from '@/lib/imageConvert';

export default function PngToJpg() {
  const tool = getToolBySlug('png-to-jpg')!;
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [quality, setQuality] = useState(90);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function convert(f: File, q: number) {
    setLoading(true);
    try {
      const res = await convertImage(f, 'image/jpeg', q / 100);
      setResult(res);
    } finally { setLoading(false); }
  }

  async function handleFile(f: File) { setFile(f); await convert(f, quality); }
  async function handleQuality(q: number) { setQuality(q); if (file) await convert(file, q); }

  return (
    <ToolLayout tool={tool} instructions="Upload a PNG image to convert it to JPG. Adjust quality as needed.">
      <input ref={inputRef} type="file" accept="image/png" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">{loading ? 'Converting...' : 'Click to upload PNG'}</div>
      </div>
      {file && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Quality</span><span>{quality}%</span>
          </div>
          <Slider min={10} max={100} value={[quality]} onValueChange={([v]) => handleQuality(v)} />
        </div>
      )}
      {result && (
        <div className="text-center">
          <img src={result.url} className="max-h-48 mx-auto rounded-lg mb-4 object-contain" alt="Converted" />
          <Button onClick={() => downloadDataUrl(result.url, result.name)}>Download JPG</Button>
        </div>
      )}
    </ToolLayout>
  );
}
