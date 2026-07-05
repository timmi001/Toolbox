import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Minimize2, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

const PRESETS = [
  { label: '720p', maxH: 720, bps: 1_500_000 },
  { label: '480p', maxH: 480, bps: 800_000 },
  { label: '360p', maxH: 360, bps: 500_000 },
  { label: '240p', maxH: 240, bps: 250_000 },
];

function fmtSize(b: number) { return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`; }

export default function VideoCompressor() {
  const tool = getToolBySlug('video-compressor')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [preset, setPreset] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [outSize, setOutSize] = useState<number | null>(null);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) { setFile(f); setDone(false); setError(''); setOutSize(null); setSrcUrl(URL.createObjectURL(f)); }

  const compress = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const p = PRESETS[preset];
      await new Promise<void>(r => { if (video.readyState >= 1) r(); else video.onloadedmetadata = () => r(); });
      const vw = video.videoWidth, vh = video.videoHeight;
      const scale = Math.min(1, p.maxH / Math.max(vw, vh));
      canvas.width = Math.round(vw * scale);
      canvas.height = Math.round(vh * scale);
      const ctx = canvas.getContext('2d')!;
      const mime = 'video/webm';
      const stream = canvas.captureStream(24);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: p.bps });
      mr.ondataavailable = e => chunks.push(e.data);
      const done$ = new Promise<void>(res => {
        mr.onstop = () => {
          const blob = new Blob(chunks, { type: mime });
          setOutSize(blob.size);
          downloadBlob(blob, file.name.replace(/\.[^.]+$/, '') + `_${p.label}.webm`);
          setDone(true); res();
        };
      });
      mr.start(100);
      video.currentTime = 0;
      await new Promise<void>(r => { video.onseeked = () => r(); });
      video.play();
      const dur = video.duration;
      await new Promise<void>(res => {
        const tick = () => {
          if (video.ended) { mr.stop(); res(); return; }
          setProgress(Math.round((video.currentTime / dur) * 100));
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        video.onended = () => { mr.stop(); res(); };
      });
      await done$;
    } catch { setError('Compression failed. Try a shorter video.'); }
    finally { setProcessing(false); }
  }, [file, preset]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, choose a target resolution, then click Compress. The output is a WebM file at the selected resolution and bitrate.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <Minimize2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        {file && <p className="text-xs text-muted-foreground mt-1">Original: {fmtSize(file.size)}</p>}
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} className="w-full rounded-lg mb-4 max-h-40 bg-black" muted preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Target Resolution</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPreset(i)}
              className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${preset === i ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card hover:border-primary/50'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {outSize && file && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
            <div className="font-bold">{fmtSize(file.size)}</div>
            <div className="text-xs text-muted-foreground">Original</div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <div className="font-bold text-primary">{fmtSize(outSize)}</div>
            <div className="text-xs text-muted-foreground">Compressed ({Math.round((1 - outSize / file.size) * 100)}% smaller)</div>
          </div>
        </div>
      )}

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Compressing…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={compress} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Compressing…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Minimize2 className="w-4 h-4" /> Compress</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
