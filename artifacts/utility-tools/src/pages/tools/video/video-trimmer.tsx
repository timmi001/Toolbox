import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Clapperboard, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

export default function VideoTrimmer() {
  const tool = getToolBySlug('video-trimmer')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f); setDone(false); setError(''); setSrcUrl(URL.createObjectURL(f));
  }

  function onMeta() {
    const v = videoRef.current!;
    setDuration(v.duration); setStart(0); setEnd(v.duration);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60), sec = (s % 60).toFixed(1);
    return `${m}:${sec.padStart(4, '0')}`;
  }

  const trim = useCallback(async () => {
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
          downloadBlob(new Blob(chunks, { type: mime }), file.name.replace(/\.[^.]+$/, '') + '_trimmed.webm');
          setDone(true); res();
        };
      });
      mr.start(100);
      video.currentTime = start;
      await new Promise<void>(r => { video.onseeked = () => r(); });
      video.play();
      const seg = end - start;
      await new Promise<void>(res => {
        const tick = () => {
          if (video.currentTime >= end || video.ended) { video.pause(); mr.stop(); res(); return; }
          setProgress(Math.round(((video.currentTime - start) / seg) * 100));
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await done$;
    } catch { setError('Trim failed. Try a different file.'); }
    finally { setProcessing(false); }
  }, [file, start, end]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, drag the start and end sliders to select the segment you want to keep, then click Trim.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <Clapperboard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} onLoadedMetadata={onMeta} className="w-full rounded-lg mb-4 max-h-40 bg-black" controls muted preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      {duration > 0 && (
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Start</span><span className="font-mono font-medium">{fmt(start)}</span></div>
            <input type="range" min={0} max={duration} step={0.1} value={start} onChange={e => setStart(Math.min(Number(e.target.value), end - 0.5))} className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">End</span><span className="font-mono font-medium">{fmt(end)}</span></div>
            <input type="range" min={0} max={duration} step={0.1} value={end} onChange={e => setEnd(Math.max(Number(e.target.value), start + 0.5))} className="w-full accent-primary" />
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center text-sm">
            Output: <strong>{fmt(end - start)}</strong> of {fmt(duration)}
          </div>
        </div>
      )}

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Trimming…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={trim} disabled={!file || processing || duration === 0} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Trimming…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Clapperboard className="w-4 h-4" /> Trim & Download</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
