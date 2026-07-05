import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

function formatSize(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ImageMetadata() {
  const tool = getToolBySlug('image-metadata')!;
  const [meta, setMeta] = useState<Record<string, string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const aspectGcd = (a: number, b: number): number => b ? aspectGcd(b, a % b) : a;
      const g = aspectGcd(img.width, img.height);
      setMeta({
        'File Name': file.name,
        'File Size': formatSize(file.size),
        'File Type': file.type || 'Unknown',
        'Last Modified': new Date(file.lastModified).toLocaleString(),
        'Width': img.width + 'px',
        'Height': img.height + 'px',
        'Aspect Ratio': `${img.width / g}:${img.height / g}`,
        'Megapixels': ((img.width * img.height) / 1000000).toFixed(2) + ' MP',
        'Resolution': img.width + ' × ' + img.height,
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload any image to view its metadata including dimensions, file size, and type.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6">
        <div className="text-4xl mb-2">ℹ️</div>
        <div className="font-medium">Click to upload image</div>
        <div className="text-sm text-muted-foreground">Any image format supported</div>
      </div>
      {meta && (
        <div className="space-y-2">
          {Object.entries(meta).map(([key, value]) => (
            <div key={key} className="flex justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground">{key}</span>
              <span className="text-sm font-mono font-medium">{value}</span>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => { setMeta(null); inputRef.current && (inputRef.current.value = ''); }}>Reset</Button>
        </div>
      )}
    </ToolLayout>
  );
}
