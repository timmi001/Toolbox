import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Video, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

const QUALITY_OPTIONS = [
  { label: 'High (original size)', bps: 4_000_000, scale: 1 },
  { label: 'Medium (720p)', bps: 2_000_000, scale: 720 },
  { label: 'Low (480p)', bps: 1_000_000, scale: 480 },
];

export default function VideoConverter() {
  const tool = getToolBySlug('video-converter')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [quality, setQuality] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f); setDone(false); setError(''); setProgress(0);
    setSrcUrl(URL.createObjectURL(f));
  }

  const convert = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const opt = QUALITY_OPTIONS[quality];
      await new Promise<void>(r => { video.onloadedmetadata = () => r(); if (video.readyState >= 1) r(); });
      const vw = video.videoWidth, vh = video.videoHeight;
      if (opt.scale < 1) { canvas.width = vw; canvas.height = vh; }
      else if (opt.scale === 1) { canvas.width = vw; canvas.height = vh; }
      else { const ratio = Math.min(opt.scale / vh, opt.scale / vw); canvas.width = Math.round(vw * ratio); canvas.height = Math.round(vh * ratio); }
      const ctx = canvas.getContext('2d')!;
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime.split(';')[0], videoBitsPerSecond: opt.bps });
      mr.ondataavailable = e => chunks.push(e.data);
      const ended = new Promise<void>(res => { mr.onstop = () => { downloadBlob(new Blob(chunks, { type: 'video/webm' }), file.name.replace(/\.[^.]+$/, '') + '.webm'); setDone(true); res(); }; });
      mr.start(100);
      video.currentTime = 0;
      await new Promise<void>(r => { video.onseeked = () => r(); });
      video.play();
      const dur = video.duration;
      await new Promise<void>(res => {
        const tick = () => {
          if (video.ended || video.paused) { mr.stop(); res(); return; }
          setProgress(Math.round((video.currentTime / dur) * 100));
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        video.onended = () => { mr.stop(); res(); };
      });
      await ended;
    } catch (e) { setError('Conversion failed. Try a shorter video.'); }
    finally { setProcessing(false); }
  }, [file, quality]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video file, choose output quality, then click Convert. Output is WebM format (plays in all modern browsers). Processing happens entirely in your browser.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} className="w-full rounded-lg mb-4 max-h-48 bg-black" muted preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Output Quality</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUALITY_OPTIONS.map((opt, i) => (
            <button key={i} onClick={() => setQuality(i)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${quality === i ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card hover:border-primary/50'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Converting…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Choose File</Button>
        <Button onClick={convert} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Video className="w-4 h-4" /> Convert to WebM</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
