import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Clapperboard, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

// ---- Minimal GIF89a encoder ----
function encodeGIF(frames: ImageData[], delayCs: number): Blob {
  // Build a fixed 64-color palette (4 levels per channel: 0,85,170,255)
  const pal: number[] = [];
  for (let r = 0; r < 4; r++) for (let g = 0; g < 4; g++) for (let b = 0; b < 4; b++) {
    pal.push(Math.round(r * 85), Math.round(g * 85), Math.round(b * 85));
  }
  while (pal.length < 256 * 3) pal.push(0);
  const palSize = 6; // 2^(palSize+1) = 128 -> use 64 of them, pad with black

  function quantize(data: Uint8ClampedArray): Uint8Array {
    const out = new Uint8Array(data.length / 4);
    for (let i = 0; i < out.length; i++) {
      const ri = Math.min(3, Math.round(data[i * 4] / 85));
      const gi = Math.min(3, Math.round(data[i * 4 + 1] / 85));
      const bi = Math.min(3, Math.round(data[i * 4 + 2] / 85));
      out[i] = ri * 16 + gi * 4 + bi;
    }
    return out;
  }

  function lzwCompress(pixels: Uint8Array, minCode: number): Uint8Array {
    const clearCode = 1 << minCode;
    const eoi = clearCode + 1;
    let codeSize = minCode + 1;
    let nextCode = eoi + 1;
    const table = new Map<string, number>();
    const bits: number[] = [];
    function emit(code: number) {
      for (let b = 0; b < codeSize; b++) bits.push((code >> b) & 1);
    }
    function initTable() {
      table.clear();
      for (let i = 0; i < clearCode; i++) table.set(String(i), i);
      nextCode = eoi + 1; codeSize = minCode + 1;
    }
    initTable(); emit(clearCode);
    let idx = 0, str = String(pixels[idx++]);
    while (idx < pixels.length) {
      const c = String(pixels[idx++]);
      const sc = str + ',' + c;
      if (table.has(sc)) { str = sc; }
      else {
        emit(table.get(str)!);
        if (nextCode < 4096) { table.set(sc, nextCode++); if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++; }
        else { emit(clearCode); initTable(); }
        str = c;
      }
    }
    emit(table.get(str)!); emit(eoi);
    const bytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8 && i + j < bits.length; j++) b |= bits[i + j] << j;
      bytes.push(b);
    }
    // Pack into sub-blocks
    const result: number[] = [minCode];
    for (let i = 0; i < bytes.length; i += 255) {
      const chunk = bytes.slice(i, i + 255);
      result.push(chunk.length, ...chunk);
    }
    result.push(0); // block terminator
    return new Uint8Array(result);
  }

  const w = frames[0].width, h = frames[0].height;
  const parts: Uint8Array[] = [];

  // Header
  parts.push(new TextEncoder().encode('GIF89a'));
  // Logical Screen Descriptor
  const lsd = new Uint8Array(7);
  new DataView(lsd.buffer).setUint16(0, w, true);
  new DataView(lsd.buffer).setUint16(2, h, true);
  lsd[4] = 0b11110101; // GCT flag, 7 colors resolution, 64-color palette (2^6=64, field = 5 -> 64 colors)
  lsd[5] = 0; lsd[6] = 0;
  parts.push(lsd);
  // Global Color Table (64 entries + padding to 128)
  const gct = new Uint8Array(128 * 3);
  for (let i = 0; i < pal.length && i < gct.length; i++) gct[i] = pal[i];
  parts.push(gct);
  // Netscape loop extension
  parts.push(new Uint8Array([0x21, 0xFF, 0x0B, ...new TextEncoder().encode('NETSCAPE2.0'), 3, 1, 0, 0, 0]));

  for (const frame of frames) {
    const pixels = quantize(frame.data);
    const lzw = lzwCompress(pixels, 6);
    // Graphic Control Extension
    const gce = new Uint8Array([0x21, 0xF9, 4, 0, delayCs & 0xFF, (delayCs >> 8) & 0xFF, 0, 0]);
    parts.push(gce);
    // Image Descriptor
    const id = new Uint8Array(10);
    id[0] = 0x2C;
    new DataView(id.buffer).setUint16(1, 0, true);
    new DataView(id.buffer).setUint16(3, 0, true);
    new DataView(id.buffer).setUint16(5, w, true);
    new DataView(id.buffer).setUint16(7, h, true);
    id[9] = 0; // no local color table
    parts.push(id);
    parts.push(lzw);
  }
  parts.push(new Uint8Array([0x3B])); // trailer

  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return new Blob([out], { type: 'image/gif' });
}
// ---- end GIF encoder ----

export default function GifMaker() {
  const tool = getToolBySlug('gif-maker')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [fps, setFps] = useState(8);
  const [width, setWidth] = useState(320);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) { setFile(f); setDone(false); setError(''); setSrcUrl(URL.createObjectURL(f)); }
  function onMeta() { const v = videoRef.current!; setDuration(v.duration); setStart(0); setEnd(Math.min(10, v.duration)); }
  function fmt(s: number) { const m = Math.floor(s / 60); return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}`; }

  const makeGif = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ar = video.videoHeight / video.videoWidth;
      canvas.width = width;
      canvas.height = Math.round(width * ar);
      const ctx = canvas.getContext('2d')!;
      const seg = end - start;
      const totalFrames = Math.round(seg * fps);
      const frames: ImageData[] = [];
      for (let i = 0; i < totalFrames; i++) {
        const t = start + (i / fps);
        video.currentTime = t;
        await new Promise<void>(r => { video.onseeked = () => r(); });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        setProgress(Math.round((i / totalFrames) * 80));
      }
      setProgress(85);
      const delayCs = Math.round(100 / fps);
      const blob = encodeGIF(frames, delayCs);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, '') + '.gif');
      setDone(true); setProgress(100);
    } catch (e) { setError('GIF creation failed. Try reducing the duration or resolution.'); }
    finally { setProcessing(false); }
  }, [file, start, end, fps, width]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, set the clip range (keep it short — under 10 seconds works best), choose frame rate and width, then click Create GIF.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <Clapperboard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} onLoadedMetadata={onMeta} className="w-full rounded-lg mb-4 max-h-36 bg-black" controls muted preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      {duration > 0 && (
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Start</span><span className="font-mono">{fmt(start)}</span></div>
            <input type="range" min={0} max={duration} step={0.1} value={start} onChange={e => setStart(Math.min(Number(e.target.value), end - 0.5))} className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">End</span><span className="font-mono">{fmt(end)}</span></div>
            <input type="range" min={0} max={duration} step={0.1} value={end} onChange={e => setEnd(Math.max(Number(e.target.value), start + 0.5))} className="w-full accent-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Frame Rate</span><span className="font-mono font-bold">{fps} fps</span></div>
              <input type="range" min={2} max={15} step={1} value={fps} onChange={e => setFps(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Width</span><span className="font-mono font-bold">{width}px</span></div>
              <input type="range" min={120} max={640} step={40} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 dark:text-amber-400">
            ⚠️ GIF creation is CPU-intensive. Keep clips under 10 seconds and use low frame rates for best results.
            Estimated frames: <strong>{Math.round((end - start) * fps)}</strong>
          </div>
        </div>
      )}

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>{progress < 80 ? 'Capturing frames…' : 'Encoding GIF…'}</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={makeGif} disabled={!file || processing || duration === 0} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Clapperboard className="w-4 h-4" /> Create GIF</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
