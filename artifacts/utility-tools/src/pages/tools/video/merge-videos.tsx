import { useState, useRef, useCallback } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Film, Loader2, CheckCircle2, X, GripVertical } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

function fmtSize(b: number) { return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`; }

export default function MergeVideos() {
  const tool = getToolBySlug('merge-videos')!;
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fl: FileList | File[]) { setFiles(prev => [...prev, ...Array.from(fl)]); setDone(false); }
  function remove(i: number) { setFiles(prev => prev.filter((_, j) => j !== i)); }

  const merge = useCallback(async () => {
    if (files.length < 2 || !canvasRef.current) return;
    setProcessing(true); setError(''); setDone(false); setProgress(0);
    try {
      const canvas = canvasRef.current;
      const mime = 'video/webm';
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(canvas.captureStream(30), { mimeType: mime });
      mr.ondataavailable = e => chunks.push(e.data);
      const done$ = new Promise<void>(res => {
        mr.onstop = () => {
          downloadBlob(new Blob(chunks, { type: mime }), 'merged.webm');
          setDone(true); res();
        };
      });
      mr.start(100);
      const ctx = canvas.getContext('2d')!;
      let globalDur = 0;
      for (const f of files) { const v2 = document.createElement('video'); v2.src = URL.createObjectURL(f); await new Promise<void>(r => { v2.onloadedmetadata = () => r(); }); globalDur += v2.duration; }
      let played = 0;
      for (let fi = 0; fi < files.length; fi++) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(files[fi]);
        vid.muted = true;
        await new Promise<void>(r => { vid.onloadedmetadata = () => r(); });
        canvas.width = vid.videoWidth; canvas.height = vid.videoHeight;
        vid.currentTime = 0;
        await new Promise<void>(r => { vid.onseeked = () => r(); });
        vid.play();
        const segDur = vid.duration;
        await new Promise<void>(res => {
          const tick = () => {
            if (vid.ended) { played += segDur; setProgress(Math.round((played / globalDur) * 100)); res(); return; }
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            setProgress(Math.round(((played + vid.currentTime) / globalDur) * 100));
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          vid.onended = () => res();
        });
      }
      mr.stop();
      await done$;
    } catch { setError('Merge failed. Ensure all files are valid videos.'); }
    finally { setProcessing(false); }
  }, [files]);

  return (
    <ToolLayout tool={tool} instructions="Add two or more video files in playback order, then click Merge. Videos are joined sequentially into a single WebM file.">
      <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}>
        <Film className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">Drop video files here or click to add</p>
        <p className="text-xs text-muted-foreground mt-1">Add at least 2 videos</p>
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {files.length > 0 && (
        <div className="space-y-2 mb-6">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-lg">
              <GripVertical className="w-4 h-4 text-muted-foreground/40" />
              <span className="text-sm font-medium flex-1 truncate">{i + 1}. {f.name}</span>
              <span className="text-xs text-muted-foreground">{fmtSize(f.size)}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(i)}><X className="w-3 h-3" /></Button>
            </div>
          ))}
        </div>
      )}

      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1"><span>Merging…</span><span>{progress}%</span></div>
          <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Add Files</Button>
        <Button onClick={merge} disabled={files.length < 2 || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Merging…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Film className="w-4 h-4" /> Merge {files.length > 1 ? `${files.length} Videos` : ''}</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
