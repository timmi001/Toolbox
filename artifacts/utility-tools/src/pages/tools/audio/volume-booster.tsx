import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Volume2, Loader2, CheckCircle2 } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function VolumeBooster() {
  const tool = getToolBySlug('volume-booster')!;
  const [file, setFile] = useState<File | null>(null);
  const [gain, setGain] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function toDb(g: number) {
    return (20 * Math.log10(g)).toFixed(1);
  }

  async function process() {
    if (!file) return;
    setProcessing(true); setError(''); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const ctx = new AudioContext();
      const ab = await ctx.decodeAudioData(buf);
      const offCtx = new OfflineAudioContext(ab.numberOfChannels, ab.length, ab.sampleRate);
      const src = offCtx.createBufferSource();
      src.buffer = ab;
      const gainNode = offCtx.createGain();
      gainNode.gain.value = gain;
      src.connect(gainNode);
      gainNode.connect(offCtx.destination);
      src.start(0);
      const rendered = await offCtx.startRendering();
      downloadBlob(encodeWAV(rendered), file.name.replace(/\.[^.]+$/, '') + `_${gain}x.wav`);
      setDone(true);
      ctx.close();
    } catch { setError('Processing failed. Please try another file.'); }
    finally { setProcessing(false); }
  }

  const gainLabel = gain === 1 ? 'Original volume (0 dB)' : gain > 1 ? `+${toDb(gain)} dB (${gain}× louder)` : `${toDb(gain)} dB (${gain}× quieter)`;

  return (
    <ToolLayout tool={tool} instructions="Upload an audio file, set the volume multiplier, then click Apply to download the adjusted file.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && setFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <Volume2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop audio file here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="audio/*" className="hidden"
          onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Volume multiplier</span>
          <span className="font-mono font-bold text-primary">{gain}×</span>
        </div>
        <input type="range" min={0.1} max={5} step={0.1} value={gain}
          onChange={e => { setGain(Number(e.target.value)); setDone(false); }}
          className="w-full accent-primary mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1× (quieter)</span><span>1× (original)</span><span>5× (louder)</span>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">{gainLabel}</p>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={process} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Volume2 className="w-4 h-4" /> Apply & Download</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
