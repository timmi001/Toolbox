import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Gauge, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

const SPEEDS = [
  { label: '0.25×', value: 0.25 },
  { label: '0.5×', value: 0.5 },
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
  { label: '3×', value: 3 },
];

export default function ChangeVideoSpeed() {
  const tool = getToolBySlug('change-video-speed')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) { setFile(f); setDone(false); setError(''); setSrcUrl(URL.createObjectURL(f)); }
  function onMeta() { setDuration(videoRef.current!.duration); }

  function fmtDur(s: number) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  const process = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      const mime = 'video/webm';
      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = e => chunks.push(e.data);
      const done$ = new Promise<void>(res => {
        mr.onstop = () => {
          downloadBlob(new Blob(chunks, { type: mime }), file.name.replace(/\.[^.]+$/, '') + `_${speed}x.webm`);
          setDone(true); res();
        };
      });
      mr.start(100);
      video.playbackRate = speed;
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
    } catch { setError('Processing failed.'); }
    finally { setProcessing(false); }
  }, [file, speed]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, choose a playback speed, then click Process. The output is a WebM file at the new speed. Slow-motion or time-lapse effects are rendered in real time.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <Gauge className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} onLoadedMetadata={onMeta} className="w-full rounded-lg mb-4 max-h-36 bg-black" controls muted preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Playback Speed</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {SPEEDS.map((s) => (
            <button key={s.value} onClick={() => { setSpeed(s.value); setDone(false); }}
              className={`py-2.5 px-1 rounded-lg border text-sm font-medium transition-colors ${speed === s.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card hover:border-primary/50'}`}>
              {s.label}
            </button>
          ))}
        </div>
        {duration > 0 && speed !== 1 && (
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Output duration: <strong>{fmtDur(duration / speed)}</strong>
            <span className="text-xs"> (original: {fmtDur(duration)})</span>
          </p>
        )}
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Processing at {speed}×…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={process} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Gauge className="w-4 h-4" /> Apply Speed Change</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
