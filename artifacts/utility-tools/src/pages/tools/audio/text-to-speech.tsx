import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Play, Square, Volume2 } from 'lucide-react';

export default function TextToSpeech() {
  const tool = getToolBySlug('text-to-speech')!;
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => 'speechSynthesis' in window);

  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(v.length ? v : speechSynthesis.getVoices());
    };
    load();
    speechSynthesis.onvoiceschanged = load;
    return () => { speechSynthesis.cancel(); };
  }, []);

  function speak() {
    if (!text.trim() || !supported) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (voices[voiceIdx]) utt.voice = voices[voiceIdx];
    utt.rate = rate;
    utt.pitch = pitch;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    speechSynthesis.speak(utt);
  }

  function stop() {
    speechSynthesis.cancel();
    setSpeaking(false);
  }

  if (!supported) {
    return (
      <ToolLayout tool={tool}>
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Text-to-speech is not supported in this browser. Try Chrome or Edge.</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout tool={tool} instructions="Type or paste your text, choose a voice, adjust speed and pitch, then click Speak. The browser reads aloud using built-in speech synthesis.">
      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste text here to convert to speech…"
        className="min-h-[180px] mb-6 text-base"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Voice</label>
          <select
            value={voiceIdx}
            onChange={e => setVoiceIdx(Number(e.target.value))}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {voices.map((v, i) => (
              <option key={i} value={i}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Speed <span className="text-primary font-mono">{rate}×</span>
          </label>
          <input type="range" min={0.5} max={2} step={0.1} value={rate}
            onChange={e => setRate(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0.5×</span><span>2×</span></div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Pitch <span className="text-primary font-mono">{pitch}</span>
          </label>
          <input type="range" min={0.5} max={2} step={0.1} value={pitch}
            onChange={e => setPitch(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Low</span><span>High</span></div>
        </div>
      </div>

      <div className="flex gap-3">
        {!speaking ? (
          <Button onClick={speak} disabled={!text.trim()} className="flex-1 gap-2">
            <Play className="w-4 h-4" /> Speak
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10">
            <Square className="w-4 h-4" /> Stop
          </Button>
        )}
      </div>

      {speaking && (
        <div className="mt-4 flex items-center justify-center gap-2 text-primary text-sm">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Speaking…</span>
        </div>
      )}
    </ToolLayout>
  );
}
