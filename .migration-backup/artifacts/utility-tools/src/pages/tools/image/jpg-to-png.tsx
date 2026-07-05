import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { convertImage, downloadDataUrl } from '@/lib/imageConvert';

export default function JpgToPng() {
  const tool = getToolBySlug('jpg-to-png')!;
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const res = await convertImage(file, 'image/png');
      setResult(res);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a JPG image to convert it to PNG format.">
      <input ref={inputRef} type="file" accept="image/jpeg,image/jpg" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="font-medium">{loading ? 'Converting...' : 'Click to upload JPG'}</div>
      </div>
      {result && (
        <div className="text-center">
          <img src={result.url} className="max-h-48 mx-auto rounded-lg mb-4 object-contain" alt="Converted" />
          <div className="text-sm text-green-400 mb-3">Converted to PNG successfully</div>
          <Button onClick={() => downloadDataUrl(result.url, result.name)}>Download PNG</Button>
        </div>
      )}
    </ToolLayout>
  );
}
