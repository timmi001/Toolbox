import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Download, ImageIcon } from 'lucide-react';

const SCALES = [2, 3, 4, 6, 8];

export default function HiResExport() {
  const tool = getToolBySlug('hi-res-export')!;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [info, setInfo] = useState<{ w: number; h: number; name: string } | null>(null);
  const [scale, setScale] = useState(2);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setInfo({ w: img.naturalWidth, h: img.naturalHeight, name: file.name.replace(/\.[^.]+$/, '') });
      setImageSrc(url);
    };
    img.src = url;
  };

  const exportImage = () => {
    const img = imgRef.current;
    if (!img || !info) return;
    setExporting(true);
    requestAnimationFrame(() => {
      const canvas = document.createElement('canvas');
      canvas.width = info.w * scale;
      canvas.height = info.h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${info.name}_${scale}x_${canvas.width}x${canvas.height}.png`;
        a.click();
        setExporting(false);
      }, 'image/png');
    });
  };

  return (
    <ToolLayout tool={tool} instructions="Upload any image, choose an upscale multiplier, then export a high-resolution PNG. Output is rendered with high-quality bicubic smoothing.">
      {!imageSrc ? (
        <div
          className="border-2 border-dashed border-border/60 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
        >
          <ImageIcon className="mx-auto mb-4 text-muted-foreground w-10 h-10" />
          <p className="text-lg font-semibold mb-1">Drop image here or click to upload</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, WebP — any size</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden border border-border bg-muted/10 flex items-center justify-center p-4">
            <img ref={imgRef} src={imageSrc} alt="preview" className="max-h-64 max-w-full object-contain rounded" crossOrigin="anonymous" />
          </div>

          {info && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <div className="font-bold text-foreground">{info.w} × {info.h}</div>
                <div className="text-muted-foreground text-xs mt-0.5">Original (px)</div>
              </div>
              {SCALES.map(s => (
                <div key={s} className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="font-bold text-foreground">{info.w * s} × {info.h * s}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{s}× output (px)</div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Scale multiplier</p>
            <div className="flex flex-wrap gap-2">
              {SCALES.map(s => (
                <Button
                  key={s}
                  variant={scale === s ? 'default' : 'outline'}
                  onClick={() => setScale(s)}
                  className="min-w-[64px]"
                >
                  {s}×
                </Button>
              ))}
            </div>
            {info && (
              <p className="text-xs text-muted-foreground">
                Output: <strong>{info.w * scale} × {info.h * scale} px</strong> — approximately {((info.w * scale * info.h * scale * 4) / 1024 / 1024).toFixed(1)} MB uncompressed
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={exportImage} disabled={exporting} className="gap-2">
              <Download className="w-4 h-4" /> {exporting ? 'Exporting…' : `Export ${scale}× PNG`}
            </Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" /> Change Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
