import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Mic, Square, Copy, Download, Trash2, CheckCircle2, FileAudio } from 'lucide-react';
import { downloadBlob } from '@/lib/audio-utils';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function SpeechToText() {
  const tool = getToolBySlug('speech-to-text')!;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const finalRef = useRef(''); // tracks finalized text to avoid duplication
  const supported = !!SpeechRecognition;

  useEffect(() => () => { recRef.current?.stop(); }, []);

  function start() {
    setError('');
    finalRef.current = transcript; // continue from existing text
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let newFinal = '';
      let intr = '';
      // Only process results from resultIndex onward to avoid duplication
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) newFinal += r[0].transcript + ' ';
        else intr += r[0].transcript;
      }
      if (newFinal) {
        finalRef.current += newFinal;
        setTranscript(finalRef.current);
      }
      setInterim(intr);
    };
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') setError('Microphone access denied. Please allow permissions.');
      else setError(`Recognition error: ${e.error}`);
      setListening(false);
    };
    rec.onend = () => { setListening(false); setInterim(''); };

    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  function stop() {
    recRef.current?.stop();
    setListening(false);
    setInterim('');
  }

  async function copy() {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!supported) {
    return (
      <ToolLayout tool={tool}>
        <div className="text-center py-12 text-muted-foreground">
          <FileAudio className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Speech recognition is not supported in this browser. Please use Chrome or Edge.</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout tool={tool} instructions="Click Start Listening and speak. Your words appear in real-time. Click Stop when done. Copy or download the transcript.">
      <div className="flex gap-3 mb-6">
        {!listening ? (
          <Button onClick={start} className="gap-2 bg-destructive hover:bg-destructive/90 text-white flex-1">
            <Mic className="w-4 h-4" /> Start Listening
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" className="gap-2 flex-1 border-destructive text-destructive">
            <Square className="w-4 h-4" /> Stop Listening
          </Button>
        )}
      </div>

      {listening && (
        <div className="flex items-center gap-2 mb-3 text-destructive text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Listening… speak clearly into your microphone
        </div>
      )}

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="bg-muted/20 border border-border/50 rounded-xl p-4 min-h-[200px] mb-4 text-sm leading-relaxed">
        {transcript || interim ? (
          <>
            <span className="text-foreground">{transcript}</span>
            {interim && <span className="text-muted-foreground italic">{interim}</span>}
          </>
        ) : (
          <span className="text-muted-foreground italic">Your transcript will appear here as you speak…</span>
        )}
      </div>

      {transcript && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
            {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadBlob(new Blob([transcript], { type: 'text/plain' }), 'transcript.txt')} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setTranscript(''); finalRef.current = ''; }} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
