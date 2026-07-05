import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Download, Music, Loader2, CheckCircle2 } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function Mp3Converter() {
  const tool = getToolBySlug('mp3-converter')!;
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<{ duration: string; channels: number; sampleRate: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f); setDone(false); setError(''); setInfo(null);
    try {
      const buf = await f.arrayBuffer();
      const ctx = new AudioContext();
      const ab = await ctx.decodeAudioData(buf);
      setInfo({
        duration: ab.duration.toFixed(1),
        channels: ab.numberOfChannels,
        sampleRate: ab.sampleRate,
      });
      ctx.close();
    } catch { setError('Could not decode audio file.'); }
  }

  async function convert() {
    if (!file) return;
    setProcessing(true); setError(''); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const ctx = new AudioContext();
      const ab = await ctx.decodeAudioData(buf);
      const blob = encodeWAV(ab);
      const outName = file.name.replace(/\.[^.]+$/, '') + '.wav';
      downloadBlob(blob, outName);
      setDone(true);
      ctx.close();
    } catch (e) {
      setError('Conversion failed. Please try another file.');
    } finally {
      setProcessing(false);
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  return (
    <ToolLayout tool={tool} instructions="Upload any audio file (MP3, OGG, FLAC, AAC, WAV, etc.). Click Convert to download it as a WAV file — all processing happens in your browser.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
      >
        <Music className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
        {file ? (
          <p className="font-medium text-foreground">{file.name}</p>
        ) : (
          <>
            <p className="font-medium text-foreground mb-1">Drop an audio file here</p>
            <p className="text-sm text-muted-foreground">MP3, OGG, FLAC, AAC, WAV…</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="audio/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {info && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['Duration', `${info.duration}s`], ['Channels', info.channels === 1 ? 'Mono' : 'Stereo'], ['Sample Rate', `${info.sampleRate / 1000} kHz`]].map(([label, val]) => (
            <div key={label as string} className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{val}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" /> Choose File
        </Button>
        <Button onClick={convert} disabled={!file || processing} className="gap-2 flex-1">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Download className="w-4 h-4" /> Convert to WAV</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
