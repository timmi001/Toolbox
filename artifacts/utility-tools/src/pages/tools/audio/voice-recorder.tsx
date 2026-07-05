import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Mic, Download, Trash2, Square } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

interface Recording { url: string; blob: Blob; name: string; duration: string; }

export default function VoiceRecorder() {
  const tool = getToolBySlug('voice-recorder')!;
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0); // mirror of elapsed for stable closure access
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>(0);

  function drawWave() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d')!;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sliceW = canvas.width / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const y = (data[i] / 128) * (canvas.height / 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.stroke();
    animRef.current = requestAnimationFrame(drawWave);
  }

  async function startRec() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;
      animRef.current = requestAnimationFrame(drawWave);

      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        const dur = fmtTime(elapsedRef.current);
        setRecordings(prev => [...prev, {
          url, blob,
          name: `Recording ${prev.length + 1}`,
          duration: dur,
        }]);
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(animRef.current);
        analyserRef.current = null;
        audioCtx.close();
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      elapsedRef.current = 0;
      setElapsed(0);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } catch { setError('Microphone access denied. Please allow microphone permissions.'); }
  }

  function stopRec() {
    mediaRef.current?.stop();
    clearInterval(timerRef.current!);
    setRecording(false);
  }

  function removeRecording(i: number) {
    setRecordings(prev => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, j) => j !== i);
    });
  }

  useEffect(() => () => {
    clearInterval(timerRef.current!);
    cancelAnimationFrame(animRef.current);
  }, []);

  function fmtTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  return (
    <ToolLayout tool={tool} instructions="Click Start Recording to begin capturing from your microphone. Click Stop when done. Download any recording from the list below.">
      <div className="bg-muted/20 border border-border/50 rounded-xl p-6 mb-6 text-center">
        <canvas ref={canvasRef} width={400} height={80} className="w-full rounded-lg mb-4 bg-muted/30" />
        {recording && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            <span className="font-mono text-2xl font-bold text-destructive">{fmtTime(elapsed)}</span>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          {!recording ? (
            <Button onClick={startRec} className="gap-2 bg-destructive hover:bg-destructive/90 text-white">
              <Mic className="w-4 h-4" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRec} variant="outline" className="gap-2">
              <Square className="w-4 h-4" /> Stop
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {recordings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Recordings</h3>
          {recordings.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-lg">
              <Mic className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{rec.name}</p>
                <audio src={rec.url} controls className="w-full h-8 mt-1" />
              </div>
              <span className="text-xs text-muted-foreground">{rec.duration}</span>
              <Button size="icon" variant="ghost" onClick={() => downloadBlob(rec.blob, `${rec.name.replace(' ', '_')}.webm`)}><Download className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => removeRecording(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
