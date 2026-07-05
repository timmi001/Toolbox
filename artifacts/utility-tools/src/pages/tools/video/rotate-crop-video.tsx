import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, RotateCw, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

const ROTATIONS = [
  { label: '0° (original)', deg: 0 },
  { label: '90° clockwise', deg: 90 },
  { label: '180°', deg: 180 },
  { label: '270° clockwise', deg: 270 },
];

export default function RotateCropVideo() {
  const tool = getToolBySlug('rotate-crop-video')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) { setFile(f); setDone(false); setError(''); setSrcUrl(URL.createObjectURL(f)); }

  function onMeta() {
    drawPreview();
  }

  function drawPreview() {
    const video = videoRef.current;
    const canvas = previewRef.current;
    if (!video || !canvas) return;
    const vw = video.videoWidth, vh = video.videoHeight;
    const swap = rotation === 90 || rotation === 270;
    canvas.width = swap ? vh : vw;
    canvas.height = swap ? vw : vh;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(video, -vw / 2, -vh / 2, vw, vh);
    ctx.restore();
  }

  const process = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const vw = video.videoWidth, vh = video.videoHeight;
      const swap = rotation === 90 || rotation === 270;
      canvas.width = swap ? vh : vw;
      canvas.height = swap ? vw : vh;
      const ctx = canvas.getContext('2d')!;
      const mime = 'video/webm';
      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = e => chunks.push(e.data);
      const done$ = new Promise<void>(res => {
        mr.onstop = () => {
          downloadBlob(new Blob(chunks, { type: mime }), file.name.replace(/\.[^.]+$/, '') + `_rotated.webm`);
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
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(video, -vw / 2, -vh / 2, vw, vh);
          ctx.restore();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        video.onended = () => { mr.stop(); res(); };
      });
      await done$;
    } catch { setError('Processing failed.'); }
    finally { setProcessing(false); }
  }, [file, rotation]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, select the rotation angle, preview the result, then click Process to download the rotated WebM.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}>
        <RotateCw className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && (
        <>
          <video ref={videoRef} src={srcUrl} onLoadedMetadata={onMeta} className="hidden" muted preload="metadata" />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rotation</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROTATIONS.map((r, i) => (
                <button key={i} onClick={() => { setRotation(r.deg); setDone(false); setTimeout(drawPreview, 50); }}
                  className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${rotation === r.deg ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-card hover:border-primary/50'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {rotation !== 0 && (
            <div className="mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Preview (first frame)</p>
              <canvas ref={previewRef} className="max-w-xs mx-auto rounded-lg border border-border/50 max-h-40 object-contain" />
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Processing…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={process} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><RotateCw className="w-4 h-4" /> Rotate & Download</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
