import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';

function formatSize(b: number) { return b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB'; }
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

export default function ImageDimensions() {
  const tool = getToolBySlug('image-dimensions')!;
  const [info, setInfo] = useState<Record<string, string> | null>(null);
  const [imgUrl, setImgUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const img = new Image();
    img.onload = () => {
      const g = gcd(img.width, img.height);
      setInfo({
        'Width': `${img.width}px`,
        'Height': `${img.height}px`,
        'Aspect Ratio': `${img.width / g}:${img.height / g}`,
        'Megapixels': `${((img.width * img.height) / 1_000_000).toFixed(2)} MP`,
        'File Type': file.type,
        'File Size': formatSize(file.size),
        'Orientation': img.width > img.height ? 'Landscape' : img.width < img.height ? 'Portrait' : 'Square',
      });
    };
    img.src = url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload any image to instantly see its width, height, aspect ratio, and more.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📐</div>
        <div className="font-medium">Click to upload image</div>
      </div>
      {imgUrl && <img src={imgUrl} className="max-h-40 mx-auto rounded-lg mb-4 object-contain block" alt="Uploaded" />}
      {info && (
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(info).map(([k, v]) => (
            <div key={k} className="flex justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-sm font-mono font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
