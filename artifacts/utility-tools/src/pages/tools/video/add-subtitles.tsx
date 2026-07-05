import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Subtitles, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

interface SrtCue { start: number; end: number; text: string; }

function parseSRT(srt: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const blocks = srt.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    const timeLine = lines.find(l => l.includes('-->'));
    if (!timeLine) continue;
    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
    const toSec = (t: string) => {
      const [h, m, rest] = t.replace(',', '.').split(':');
      return Number(h) * 3600 + Number(m) * 60 + Number(rest);
    };
    const text = lines.slice(lines.indexOf(timeLine) + 1).join('\n').trim();
    if (text) cues.push({ start: toSec(startStr), end: toSec(endStr), text });
  }
  return cues;
}

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:03,500
Hello and welcome!

2
00:00:04,000 --> 00:00:07,000
This is a subtitle overlay example.`;

export default function AddSubtitles() {
  const tool = getToolBySlug('add-subtitles')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [srt, setSrt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);

  function handleVideo(f: File) { setFile(f); setDone(false); setError(''); setSrcUrl(URL.createObjectURL(f)); }

  async function handleSrtFile(f: File) {
    const text = await f.text();
    setSrt(text);
  }

  const process = useCallback(async () => {
    if (!file || !videoRef.current || !canvasRef.current || !srt.trim()) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const cues = parseSRT(srt);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      const fontSize = Math.max(18, Math.round(canvas.height / 20));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      const mime = 'video/webm';
      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = e => chunks.push(e.data);
      const done$ = new Promise<void>(res => {
        mr.onstop = () => {
          downloadBlob(new Blob(chunks, { type: mime }), file.name.replace(/\.[^.]+$/, '') + '_subtitled.webm');
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
          const t = video.currentTime;
          const active = cues.find(c => t >= c.start && t <= c.end);
          if (active) {
            const lines = active.text.split('\n');
            const lineH = fontSize * 1.3;
            const y = canvas.height - fontSize * 2 - (lines.length - 1) * lineH;
            lines.forEach((line, li) => {
              const ty = y + li * lineH;
              ctx.fillStyle = 'rgba(0,0,0,0.65)';
              const w = ctx.measureText(line).width;
              ctx.fillRect(canvas.width / 2 - w / 2 - 8, ty - fontSize, w + 16, fontSize + 8);
              ctx.fillStyle = '#ffffff';
              ctx.fillText(line, canvas.width / 2, ty);
            });
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        video.onended = () => { mr.stop(); res(); };
      });
      await done$;
    } catch { setError('Processing failed.'); }
    finally { setProcessing(false); }
  }, [file, srt]);

  return (
    <ToolLayout tool={tool} instructions="Upload a video, paste or load SRT subtitle content, then click Burn Subtitles. Subtitles are rendered directly onto the video frames.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleVideo(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}>
          <Subtitles className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium">{file ? file.name : 'Upload Video'}</p>
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleVideo(e.target.files[0])} />
        </div>
        <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => srtInputRef.current?.click()}
          onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleSrtFile(e.dataTransfer.files[0]); }}
          onDragOver={e => e.preventDefault()}>
          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium">Upload .srt File</p>
          <p className="text-xs text-muted-foreground mt-1">or paste below</p>
          <input ref={srtInputRef} type="file" accept=".srt,.vtt,.txt" className="hidden" onChange={e => e.target.files?.[0] && handleSrtFile(e.target.files[0])} />
        </div>
      </div>

      {srcUrl && <video ref={videoRef} src={srcUrl} className="w-full rounded-lg mb-4 max-h-36 bg-black" controls preload="metadata" />}
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium">SRT Subtitle Content</label>
          <button onClick={() => setSrt(SAMPLE_SRT)} className="text-xs text-primary hover:underline">Load example</button>
        </div>
        <Textarea value={srt} onChange={e => setSrt(e.target.value)} placeholder="Paste SRT content here…" className="font-mono text-xs min-h-[120px]" />
      </div>

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Rendering subtitles…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <Button onClick={process} disabled={!file || !srt.trim() || processing} className="w-full gap-2">
        {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Rendering…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Subtitles className="w-4 h-4" /> Burn Subtitles</>}
      </Button>
    </ToolLayout>
  );
}
