import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Scissors, Loader2, CheckCircle2 } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function AudioTrimmer() {
  const tool = getToolBySlug('audio-trimmer')!;
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function handleFile(f: File) {
    setFile(f); setDone(false); setError('');
    const url = URL.createObjectURL(f);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setStart(0);
      setEnd(audio.duration);
    };
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1).padStart(4, '0');
    return `${m}:${sec}`;
  }

  async function trim() {
    if (!file) return;
    setProcessing(true); setError(''); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const ctx = new AudioContext();
      const ab = await ctx.decodeAudioData(buf);
      const sr = ab.sampleRate;
      const startSample = Math.floor(start * sr);
      const endSample = Math.min(Math.ceil(end * sr), ab.length);
      const trimLen = endSample - startSample;
      const offCtx = new OfflineAudioContext(ab.numberOfChannels, trimLen, sr);
      const src = offCtx.createBufferSource();
      src.buffer = ab;
      src.connect(offCtx.destination);
      src.start(0, start, end - start);
      const rendered = await offCtx.startRendering();
      downloadBlob(encodeWAV(rendered), file.name.replace(/\.[^.]+$/, '') + '_trimmed.wav');
      setDone(true);
      ctx.close();
    } catch { setError('Trim failed. Please try another file.'); }
    finally { setProcessing(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload an audio file, set the start and end times using the sliders, then click Trim to download the clipped portion.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <Scissors className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop audio file here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="audio/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {duration > 0 && (
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Start time</span>
              <span className="font-mono font-medium">{fmt(start)}</span>
            </div>
            <input type="range" min={0} max={duration} step={0.1} value={start}
              onChange={e => setStart(Math.min(Number(e.target.value), end - 0.1))}
              className="w-full accent-primary" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">End time</span>
              <span className="font-mono font-medium">{fmt(end)}</span>
            </div>
            <input type="range" min={0} max={duration} step={0.1} value={end}
              onChange={e => setEnd(Math.max(Number(e.target.value), start + 0.1))}
              className="w-full accent-primary" />
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
            <span className="text-sm text-muted-foreground">Output duration: </span>
            <span className="font-bold">{fmt(end - start)}</span>
            <span className="text-sm text-muted-foreground"> (of {fmt(duration)} total)</span>
          </div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={trim} disabled={!file || processing || duration === 0} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Trimming…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Scissors className="w-4 h-4" /> Trim & Download</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
