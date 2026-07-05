import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Combine, Loader2, CheckCircle2, X, GripVertical } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function AudioMerger() {
  const tool = getToolBySlug('audio-merger')!;
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | File[]) {
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
    setDone(false);
  }

  function remove(i: number) {
    setFiles(prev => prev.filter((_, j) => j !== i));
    setDone(false);
  }

  async function merge() {
    if (files.length < 2) return;
    setProcessing(true); setError(''); setDone(false);
    try {
      const ctx = new AudioContext();
      const buffers: AudioBuffer[] = [];
      for (const f of files) {
        const ab = await ctx.decodeAudioData(await f.arrayBuffer());
        buffers.push(ab);
      }
      const sr = buffers[0].sampleRate;
      const numCh = buffers[0].numberOfChannels;
      const totalLen = buffers.reduce((s, b) => s + b.length, 0);
      const offCtx = new OfflineAudioContext(numCh, totalLen, sr);
      let offset = 0;
      for (const buf of buffers) {
        const src = offCtx.createBufferSource();
        src.buffer = buf;
        src.connect(offCtx.destination);
        src.start(offset / sr);
        offset += buf.length;
      }
      const rendered = await offCtx.startRendering();
      downloadBlob(encodeWAV(rendered), 'merged_audio.wav');
      setDone(true);
      ctx.close();
    } catch { setError('Merge failed. Ensure all files are valid audio.'); }
    finally { setProcessing(false); }
  }

  function fmtSize(n: number) { return n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`; }

  return (
    <ToolLayout tool={tool} instructions="Add multiple audio files in the order you want them joined, then click Merge. Files are concatenated sequentially.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
      >
        <Combine className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">Drop audio files here or click to add</p>
        <p className="text-xs text-muted-foreground mt-1">Add at least 2 files</p>
        <input ref={inputRef} type="file" accept="audio/*" multiple className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)} />
      </div>

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

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Add Files</Button>
        <Button onClick={merge} disabled={files.length < 2 || processing} className="flex-1 gap-2">
          {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Merging…</> : done ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</> : <><Combine className="w-4 h-4" /> Merge {files.length > 0 ? `${files.length} Files` : ''}</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
