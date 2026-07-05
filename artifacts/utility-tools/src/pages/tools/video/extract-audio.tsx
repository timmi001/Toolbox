import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Upload, Music2, Loader2, CheckCircle2 } from 'lucide-react';
import { encodeWAV, downloadBlob } from '@/lib/audio-utils';

export default function ExtractAudio() {
  const tool = getToolBySlug('extract-audio')!;
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<{ duration: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f); setDone(false); setError(''); setInfo(null);
    setSrcUrl(URL.createObjectURL(f));
  }

  function onMeta() {
    const v = videoRef.current!;
    const m = Math.floor(v.duration / 60);
    const s = Math.floor(v.duration % 60);
    setInfo({ duration: `${m}:${String(s).padStart(2, '0')}` });
  }

  async function extract() {
    if (!file) return;
    setProcessing(true); setError(''); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const ctx = new AudioContext();
      const ab = await ctx.decodeAudioData(buf);
      const blob = encodeWAV(ab);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, '') + '_audio.wav');
      setDone(true);
      ctx.close();
    } catch { setError('Could not extract audio. The video may have no audio track.'); }
    finally { setProcessing(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload any video file. The audio track will be decoded and saved as a WAV file — no quality loss from re-encoding.">
      <div
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <Music2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="font-medium">{file ? file.name : 'Drop video file here or click to browse'}</p>
        <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV, AVI, MKV…</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {srcUrl && (
        <video ref={videoRef} src={srcUrl} onLoadedMetadata={onMeta}
          className="w-full rounded-lg mb-4 max-h-40 bg-black" controls preload="metadata" />
      )}

      {info && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
            <div className="font-bold">{info.duration}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center">
            <div className="font-bold">WAV</div>
            <div className="text-xs text-muted-foreground">Output Format</div>
          </div>
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={() => inputRef.current?.click()} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" /> Choose File
        </Button>
        <Button onClick={extract} disabled={!file || processing} className="flex-1 gap-2">
          {processing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</>
            : done
            ? <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
            : <><Music2 className="w-4 h-4" /> Extract Audio</>}
        </Button>
      </div>
    </ToolLayout>
  );
}
