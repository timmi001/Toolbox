import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, AudioWaveform, Loader2, CheckCircle2 } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function NoiseRemover() {
  const tool = getToolBySlug('noise-remover')!;
  const [file, setFile] = useState<File | null>(null);
  const [strength, setStrength] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

      // High-pass filter: removes low-frequency rumble/hum
      const hiPass = offCtx.createBiquadFilter();
      hiPass.type = 'highpass';
      hiPass.frequency.value = 80 + strength * 1.5; // 80–230 Hz cutoff

      // Low-pass filter: removes high-frequency hiss
      const loPass = offCtx.createBiquadFilter();
      loPass.type = 'lowpass';
      loPass.frequency.value = 16000 - strength * 80; // 16000–8000 Hz cutoff

      // Dynamic compressor to even out levels
      const compressor = offCtx.createDynamicsCompressor();
      compressor.threshold.value = -30 - strength * 0.2;
      compressor.ratio.value = 3 + strength * 0.05;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      src.connect(hiPass);
      hiPass.connect(loPass);
      loPass.connect(compressor);
      compressor.connect(offCtx.destination);
      src.start(0);

      const rendered = await offCtx.startRendering();
      downloadBlob(encodeWAV(rendered), file.name.replace(/\.[^.]+$/, '') + '_clean.wav');
      setDone(true);
      ctx.close();
    } catch { setError('Processing failed. Please try another file.'); }
    finally { setProcessing(false); }
  }

  const strengthLabel = strength < 33 ? 'Light — removes mild hum and hiss' : strength < 66 ? 'Medium — balanced noise reduction' : 'Heavy — aggressive filtering (may affect voice)';

  return (
    <ToolLayout tool={tool} instructions="Upload a noisy audio file, adjust the reduction strength, then click Apply. This uses high-pass and low-pass filters to remove background hum and hiss.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && setFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <AudioWaveform className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop audio file here or click to browse'}</p>
        <input ref={inputRef} type="file" accept="audio/*" className="hidden"
          onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Noise reduction strength</span>
          <span className="font-mono font-bold text-primary">{strength}%</span>
        </div>
        <input type="range" min={0} max={100} step={1} value={strength}
          onChange={e => { setStrength(Number(e.target.value)); setDone(false); }}
          className="w-full accent-primary mb-2" />
        <p className="text-sm text-center text-muted-foreground">{strengthLabel}</p>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        <Button onClick={process} disabled={!file || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Filtering…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><AudioWaveform className="w-4 h-4" /> Remove Noise</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
