import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2 } from 'lucide-react';

function hexDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export default function BgRemover() {
  const tool = getToolBySlug('bg-remover')!;
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginal(url);
    setResult(null);
    const img = new Image();
    img.onload = () => {
      const c = hiddenRef.current!;
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d')!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const preview = canvasRef.current!;
      preview.width = img.width;
      preview.height = img.height;
      preview.getContext('2d')!.drawImage(img, 0, 0);
    };
    img.src = url;
  };

  const removeColor = useCallback((x: number, y: number) => {
    const canvas = hiddenRef.current;
    if (!canvas) return;
    setProcessing(true);
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;

    const idx = (y * canvas.width + x) * 4;
    const tr = px[idx], tg = px[idx + 1], tb = px[idx + 2];

    for (let i = 0; i < px.length; i += 4) {
      if (hexDistance(px[i], px[i + 1], px[i + 2], tr, tg, tb) <= tolerance) {
        px[i + 3] = 0;
      }
    }
    ctx.putImageData(data, 0, 0);

    const preview = canvasRef.current!;
    const pCtx = preview.getContext('2d')!;
    pCtx.clearRect(0, 0, preview.width, preview.height);
    const checkerSize = 12;
    for (let cy = 0; cy < preview.height; cy += checkerSize) {
      for (let cx = 0; cx < preview.width; cx += checkerSize) {
        pCtx.fillStyle = ((Math.floor(cx / checkerSize) + Math.floor(cy / checkerSize)) % 2 === 0) ? '#e0e0e0' : '#ffffff';
        pCtx.fillRect(cx, cy, checkerSize, checkerSize);
      }
    }
    pCtx.drawImage(canvas, 0, 0);
    setResult(canvas.toDataURL('image/png'));
    setProcessing(false);
  }, [tolerance]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    removeColor(x, y);
  };

  const reset = () => {
    setOriginal(null);
    setResult(null);
    const c = hiddenRef.current;
    if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    const p = canvasRef.current;
    if (p) p.getContext('2d')?.clearRect(0, 0, p.width, p.height);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'bg-removed.png';
    a.click();
  };

  return (
    <ToolLayout tool={tool} instructions="Upload an image, then click on the background color to remove it. Adjust tolerance to capture more or fewer shades. Download the transparent PNG when done.">
      <canvas ref={hiddenRef} className="hidden" />

      {!original ? (
        <div
          className="border-2 border-dashed border-border/60 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadImage(f); }}
        >
          <Upload className="mx-auto mb-4 text-muted-foreground w-10 h-10" />
          <p className="text-lg font-semibold mb-1">Drop image here or click to upload</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, WebP supported</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium">Tolerance: <span className="text-primary font-bold">{tolerance}</span></label>
            <input
              type="range" min={5} max={120} value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="flex-1 min-w-[120px] max-w-[200px] accent-foreground"
            />
            <p className="text-xs text-muted-foreground">Click on the background in the image below to erase it</p>
          </div>

          <div className="overflow-auto rounded-xl border border-border bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22><rect width=%226%22 height=%226%22 fill=%22%23e0e0e0%22/><rect x=%226%22 y=%226%22 width=%226%22 height=%226%22 fill=%22%23e0e0e0%22/><rect fill=%22%23fff%22 x=%226%22 width=%226%22 height=%226%22/><rect fill=%22%23fff%22 y=%226%22 width=%226%22 height=%226%22/></svg>')]">
            <canvas
              ref={canvasRef}
              className={`max-w-full cursor-crosshair ${processing ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ display: 'block', maxHeight: '460px', objectFit: 'contain' }}
              onClick={handleCanvasClick}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={download} disabled={!result} className="gap-2">
              <Download className="w-4 h-4" /> Download Transparent PNG
            </Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" /> Change Image
            </Button>
            <Button variant="ghost" onClick={reset} className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" /> Reset
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }} />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
