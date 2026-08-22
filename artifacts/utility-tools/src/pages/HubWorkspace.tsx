import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowUp, ArrowRight, BarChart3, Bookmark, BookOpen, BriefcaseBusiness, Check, ChevronDown, Code2, Copy, Download, FileText, Image, Paperclip, RotateCcw, Route, Search, Settings2, Sparkles, Target, ThumbsDown, ThumbsUp, Trash2, Trophy, UserRound, Wand2, Video, Mic, AudioLines, Captions, Crop, Eraser, Film, ImagePlus, Layers3, ListChecks, MessageCircleQuestion, MoreHorizontal, Music2, PenLine, Play, Scissors, SlidersHorizontal, Upload, Volume2, X } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { generateHubResponse } from '@/lib/hub-ai';

const HUBS = {
  ai: { title: 'AI Assistant', description: 'Write, research, analyze, and brainstorm in one focused workspace.', icon: Sparkles, color: '#46E3B5', actions: [['AI Article Writer', '/tools/ai/ai-writer'], ['AI Summarizer', '/tools/ai/ai-summarizer'], ['AI Grammar Checker', '/tools/ai/ai-grammar-checker']] },
  creator: { title: 'Creator Hub', description: 'Turn rough ideas into polished content, campaigns, and social posts.', icon: Wand2, color: '#FF66B8', actions: [['Instagram Caption', '/tools/ai/ai-instagram-caption'], ['YouTube Title', '/tools/ai/ai-youtube-title'], ['Ad Copy', '/tools/ai/ai-ad-copy-generator']] },
  study: { title: 'Study Hub', description: 'Build notes, practice questions, flashcards, and study plans.', icon: FileText, color: '#5C8DFF', actions: [['Practice Questions', '/tools/ai/ai-practice-questions'], ['Flashcards', '/tools/ai/ai-flashcard-generator'], ['Study Planner', '/tools/ai/ai-study-planner']] },
  career: { title: 'Career Hub', description: 'Prepare resumes, cover letters, interviews, and professional bios.', icon: FileText, color: '#A779FF', actions: [['Resume Builder', '/tools/ai/ai-resume-builder'], ['Cover Letter', '/tools/ai/ai-cover-letter'], ['Interview Practice', '/tools/ai/ai-interview-practice']] },
  business: { title: 'Business Hub', description: 'Create useful business documents, positioning, and marketing copy.', icon: Wand2, color: '#F7B83B', actions: [['Invoice Generator', '/tools/business/invoice-generator'], ['Business Name', '/tools/business/ai-business-name'], ['Slogan Generator', '/tools/business/ai-slogan-generator']] },
  pdf: { title: 'PDF & Documents', description: 'Merge, split, compress, and convert documents securely in your browser.', icon: FileText, color: '#FF7777', actions: [['Merge PDF', '/tools/pdf/merge-pdf'], ['Compress PDF', '/tools/pdf/compress-pdf'], ['PDF to JPG', '/tools/pdf/pdf-to-jpg']] },
  image: { title: 'Image Hub', description: 'Resize, compress, crop, and convert image assets quickly.', icon: Image, color: '#F78BCB', actions: [['Image Resizer', '/tools/image/image-resizer'], ['Image Compressor', '/tools/image/image-compressor'], ['JPG to PNG', '/tools/image/jpg-to-png']] },
  video: { title: 'Video Hub', description: 'Trim, merge, compress, and convert videos with browser-first tools.', icon: Video, color: '#48D9FF', actions: [['Video Trimmer', '/tools/video/video-trimmer'], ['Video Compressor', '/tools/video/video-compressor'], ['Video Converter', '/tools/video/video-converter']] },
  audio: { title: 'Audio Hub', description: 'Trim, convert, merge, and enhance audio without leaving your workspace.', icon: Video, color: '#FA8080', actions: [['Audio Trimmer', '/tools/audio/audio-trimmer'], ['Audio Merger', '/tools/audio/audio-merger'], ['MP3 Converter', '/tools/audio/mp3-converter']] },
  developer: { title: 'Developer Hub', description: 'Format, validate, debug, and convert code and data faster.', icon: Code2, color: '#32D5B2', actions: [['JSON Formatter', '/tools/developer/json-formatter'], ['Regex Tester', '/tools/developer/regex-tester'], ['SQL Formatter', '/tools/developer/sql-formatter']] },
  calculator: { title: 'Calculator & Converter', description: 'Solve everyday calculations and convert values with confidence.', icon: Code2, color: '#B39BFF', actions: [['Unit Converter', '/tools/calculators/unit-converter'], ['Percentage Calculator', '/tools/calculators/percentage-calculator'], ['Currency Converter', '/tools/calculators/currency-converter']] },
} as const;

type HubKey = keyof typeof HUBS;

function readPreference(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(`toolbuxx_${key}`) ?? fallback;
}

function writePreference(key: string, value: string) {
  try { window.localStorage.setItem(`toolbuxx_${key}`, value); } catch { /* best effort */ }
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SettingsPopover({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: string; onChange: (value: string) => void }) {
  if (!open) return null;
  return <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-[#263746] bg-[#101A24] p-3 shadow-2xl"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-white">Response style</span><button type="button" onClick={onClose} aria-label="Close settings" className="text-[#718194] hover:text-white"><X className="h-3.5 w-3.5" /></button></div><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-lg border border-[#263746] bg-[#0A1118] px-2 py-2 text-xs text-white"><option>Balanced</option><option>Concise</option><option>Detailed</option></select></div>;
}

const AI_QUICK_ACTIONS = ['Write', 'Explain', 'Summarize', 'Brainstorm', 'Research', 'Code', 'Translate'];

type ChatMessage = { id: number; role: 'user' | 'assistant'; content: string };

function AiAssistantWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [activeAction, setActiveAction] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [responseStyle, setResponseStyle] = useState(() => readPreference('ai-response-style', 'Balanced'));

  const sendMessage = async (requestedPrompt = prompt) => {
    const value = requestedPrompt.trim();
    if (!value || loading) return;
    setLoading(true);
    setError('');
    try {
      const answer = await generateHubResponse('ai-assistant', { prompt: value, mode: activeAction, context: `Response style: ${responseStyle}` });
      setMessages((current) => [...current, { id: Date.now(), role: 'user', content: value }, { id: Date.now() + 1, role: 'assistant', content: answer }]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the AI service.');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async (message: ChatMessage) => {
    await navigator.clipboard?.writeText(message.content);
    setCopied(message.id);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const setActionPrompt = (action: string) => {
    setActiveAction(action);
    setPrompt(`${action}: `);
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#090D12] text-white">
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1480px]">
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-[#1B2936] px-4 py-5 sm:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#245143] bg-[#103027] text-[#5BE4B6]"><Sparkles className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold tracking-tight text-white">AI Assistant</h1><p className="mt-1 hidden truncate text-xs text-[#8492A3] sm:block sm:text-sm">Your everyday AI for thinking, writing, learning and getting things done.</p></div></div><div className="relative flex shrink-0 gap-1"><button type="button" onClick={() => setSettingsOpen((open) => !open)} className="rounded-xl p-2.5 text-[#8190A0] hover:bg-[#13202A] hover:text-white" aria-label="Settings"><Settings2 className="h-4 w-4" /></button><SettingsPopover open={settingsOpen} onClose={() => setSettingsOpen(false)} value={responseStyle} onChange={(value) => { setResponseStyle(value); writePreference('ai-response-style', value); }} /><Link href="/history" className="rounded-xl p-2.5 text-[#8190A0] hover:bg-[#13202A] hover:text-white" aria-label="History"><Search className="h-4 w-4" /></Link></div></header>

          <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
              {messages.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-10 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#245143] bg-[#103027] text-[#5BE4B6] shadow-[0_0_35px_rgba(91,228,182,0.12)]"><Sparkles className="h-7 w-7" /></div><h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">What can I help you with today?</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#8492A3]">Ask a question, bring an idea, or start with one of the focused actions below.</p><div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">{[['Write something', 'Draft a polished message'], ['Solve a problem', 'Break down a challenge'], ['Learn something', 'Explain a new topic'], ['Create an idea', 'Brainstorm possibilities']].map(([title, description]) => <button key={title} type="button" onClick={() => setPrompt(`${title}: `)} className="rounded-2xl border border-[#1E2D3B] bg-[#0E151D] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><div className="text-xs font-semibold text-white">{title}</div><div className="mt-2 text-[10px] leading-4 text-[#718194]">{description}</div></button>)}</div></div> : <div className="space-y-6 py-4">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16453B] text-[#E4FFF6]' : 'border border-[#1E2D3B] bg-[#0E151D] text-[#CBD6E0]'}`}><ReactMarkdown components={{ pre: ({ children }) => <pre className="group relative my-3 overflow-x-auto rounded-xl border border-[#263746] bg-[#080C11] p-3 text-xs leading-5">{children}<button type="button" onClick={() => copyMessage(message)} className="absolute right-2 top-2 rounded-lg bg-[#17232E] p-1.5 text-[#8FA0B2] hover:text-white" aria-label="Copy message"><Copy className="h-3.5 w-3.5" /></button></pre>, code: ({ children, className, ...props }) => <code className={`${className ?? ''} font-mono`} {...props}>{children}</code> }}>{message.content}</ReactMarkdown>{message.role === 'assistant' && <div className="mt-3 flex items-center gap-1 border-t border-[#1E2D3B] pt-2"><button type="button" onClick={() => copyMessage(message)} className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Copy response"><Copy className="h-3.5 w-3.5" /></button><button type="button" onClick={() => { const previous = messages[messages.findIndex((item) => item.id === message.id) - 1]; if (previous?.role === 'user') void sendMessage(previous.content); }} className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Regenerate response"><RotateCcw className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Like response"><ThumbsUp className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Dislike response"><ThumbsDown className="h-3.5 w-3.5" /></button>{copied === message.id && <span className="ml-2 text-[10px] text-[#5BE4B6]">Copied</span>}</div>}</div></div>)}</div>}

              <div className="sticky bottom-3 mt-auto pt-5">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{AI_QUICK_ACTIONS.map((action) => <button key={action} type="button" onClick={() => setActionPrompt(action)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${activeAction === action ? 'border-[#4FD9B0] bg-[#12352D] text-[#A9F2D8]' : 'border-[#1F2D3A] bg-[#0E151D] text-[#91A0B0] hover:border-[#3DDBC0]/60 hover:text-white'}`}>{action}</button>)}</div>
                {error && <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-200"><span>{error}</span><button type="button" onClick={() => void sendMessage()} className="font-semibold text-white underline">Retry</button></div>}
                {loading && <div className="mb-3 text-xs text-[#A9F2D8]">Toolbuxx AI is thinking…</div>}
                <div className="rounded-2xl border border-[#2A3A48] bg-[#0E151D] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.3)] focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={3} placeholder="Ask anything…" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-[#68798A]" /><div className="flex items-center justify-between gap-2 px-2 pb-1"><div className="flex items-center gap-1"><button type="button" onClick={() => setPrompt((current) => `${current}${current ? '\n' : ''}Attached file: `)} className="rounded-lg p-2 text-[#8190A0] hover:bg-[#17242F] hover:text-white" aria-label="Attach file"><Paperclip className="h-4 w-4" /></button><button type="button" onClick={() => setError('Voice input is not available in this browser. Use the text box instead.')} className="rounded-lg p-2 text-[#8190A0] hover:bg-[#17242F] hover:text-white" aria-label="Voice input"><Mic className="h-4 w-4" /></button><span className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB]">Toolbuxx AI</span></div><div className="flex items-center gap-1"><span className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB]">{responseStyle}</span><button type="button" onClick={() => void sendMessage()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981] text-[#061410] transition hover:bg-[#34D399]" aria-label="Send message"><ArrowUp className="h-4 w-4" /></button></div></div></div>
                {messages.length > 0 && <button type="button" onClick={() => { setMessages([]); setPrompt(''); }} className="mx-auto mt-3 flex items-center gap-1.5 text-[11px] text-[#718194] hover:text-white"><Trash2 className="h-3 w-3" />Clear conversation</button>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const STUDY_MODES = ['Explain', 'Summarize', 'Quiz Me', 'Flashcards', 'Solve', 'Study Plan', 'Essay Help'];

const STUDY_TOOLS = [
  ['AI Quiz Generator', MessageCircleQuestion, '/tools/ai/ai-practice-questions'],
  ['Flashcard Generator', BookOpen, '/tools/ai/ai-flashcard-generator'],
  ['Notes Summarizer', FileText, '/tools/ai/ai-study-notes-generator'],
  ['Homework Helper', Target, '/tools/ai/ai-tutor-chat'],
  ['Exam Prep', Trophy, '/tools/ai/ai-mock-exam-generator'],
  ['Study Planner', ListChecks, '/tools/ai/ai-study-planner'],
] as const;

function StudyHubWorkspace() {
  const [mode, setMode] = useState('Explain');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'student' | 'tutor'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState(() => readPreference('study-subject', 'General'));
  const [level, setLevel] = useState(() => readPreference('study-level', 'Intermediate'));
  const [progressOpen, setProgressOpen] = useState(false);
  const [sessions, setSessions] = useState(() => Number(readPreference('study-sessions', '0')) || 0);

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.csv,.pdf,text/plain';
    input.style.display = 'none';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try { setPrompt(await file.text()); } catch { setError('Unable to read that study file.'); }
    };
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('button');
      if (!button) return;
      const text = button.textContent?.trim() ?? '';
      if (text.includes('Notes / PDF') || button.getAttribute('aria-label') === 'Upload image') input.click();
      if (text === 'Progress') setProgressOpen(true);
      if (text === 'Save answer') { const latest = messages.filter((message) => message.role === 'tutor').at(-1)?.text; if (latest) { writePreference('saved-study-answer', latest); setError('Answer saved in this browser.'); } }
      if (text === 'Resume study plan') setPrompt('Resume my study plan and tell me the next best study task: ');
      if (text.startsWith('Biology')) { const values = ['General', 'Biology', 'Mathematics', 'Computer Science']; const value = values[(values.indexOf(subject) + 1) % values.length]; setSubject(value); writePreference('study-subject', value); }
      if (text.startsWith('College')) { const values = ['Beginner', 'Intermediate', 'Advanced', 'College']; const value = values[(values.indexOf(level) + 1) % values.length]; setLevel(value); writePreference('study-level', value); }
    };
    document.addEventListener('click', onClick, true);
    document.body.appendChild(input);
    return () => { document.removeEventListener('click', onClick, true); input.remove(); };
  }, [level, subject, messages]);

  const askTutor = async () => {
    const value = prompt.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const answer = await generateHubResponse('study', { prompt: value, mode, subject, level });
      setMessages((current) => [...current, { role: 'student', text: value }, { role: 'tutor', text: answer }]);
      setSessions((current) => { const next = current + 1; writePreference('study-sessions', String(next)); return next; });
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the AI tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#080C11] text-white">
      {progressOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"><section className="w-full max-w-sm rounded-2xl border border-[#263746] bg-[#0D151E] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Study progress</h2><button type="button" onClick={() => setProgressOpen(false)} aria-label="Close progress" className="text-[#718194] hover:text-white"><X className="h-4 w-4" /></button></div><p className="mt-4 text-sm text-[#C5D0DB]">{sessions} completed study {sessions === 1 ? 'session' : 'sessions'} in this browser.</p><div className="mt-4 h-2 rounded-full bg-[#1B2935]"><div className="h-full rounded-full bg-[#5BE4B6]" style={{ width: `${Math.min(100, sessions * 10)}%` }} /></div></section></div>}
      <div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1B2935] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Study Hub</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Learn faster with your personal AI study assistant.</p></div></div><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-xs font-semibold text-[#A9F2D8] hover:border-[#3DDBC0]/60"><Target className="h-3.5 w-3.5 text-[#5BE4B6]" />Progress</button></header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Personal tutor</div><h2 className="mt-1 text-2xl font-bold text-white">What are you studying today?</h2></div><span className="hidden items-center gap-2 text-xs text-[#718194] sm:flex"><span className="h-2 w-2 rounded-full bg-[#5BE4B6]" />Tutor ready</span></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#263746] bg-[#0A1118] p-4 text-sm leading-6 text-[#8492A3]">Ask anything about a topic, upload your notes, or choose a study mode. I’ll explain concepts clearly and help you test yourself.</div> : <div className="mb-5 max-h-[390px] space-y-4 overflow-y-auto rounded-2xl border border-[#1B2935] bg-[#0A1118] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'student' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#263746] bg-[#101A24] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1B2935] pb-3 [scrollbar-width:none]">{STUDY_MODES.map((studyMode) => <button key={studyMode} type="button" onClick={() => setMode(studyMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === studyMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#101A24] text-[#8492A3] hover:text-white'}`}>{studyMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#0A1118] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askTutor(); } }} rows={4} placeholder="Ask a question, upload your notes, or tell me what you want to learn…" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B2935] pt-3"><div className="flex items-center gap-1"><button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#91A0B0] hover:bg-[#16242E] hover:text-white"><Upload className="h-3.5 w-3.5" />Notes / PDF</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload image"><Image className="h-4 w-4" /></button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Voice input"><Mic className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Biology <ChevronDown className="h-3 w-3" /></button><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">College <ChevronDown className="h-3 w-3" /></button><button type="button" onClick={askTutor} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask tutor"><ArrowUp className="h-4 w-4" /></button></div></div></div>{messages.length > 0 && <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setPrompt('Simplify the explanation: ')} className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">Simplify explanation</button><button type="button" onClick={() => setPrompt('Test me on this topic: ')} className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">Test me</button><button type="button" className="inline-flex items-center gap-1 rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]"><Bookmark className="h-3.5 w-3.5" />Save answer</button></div>}</section>

            <section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Study tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{STUDY_TOOLS.map(([label, Icon, href]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1B2935] bg-[#0D151E] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section>
          </main>

          <aside className="space-y-5"><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="mb-4 flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Your progress</div><div className="mt-2 text-2xl font-black text-white">This week</div></div><BookOpen className="h-5 w-5 text-[#5BE4B6]" /></div><div className="space-y-4"><div><div className="flex justify-between text-xs text-[#9EACBB]"><span>Topics studied</span><span>8</span></div><div className="mt-2 h-1.5 rounded-full bg-[#1B2935]"><div className="h-full w-[68%] rounded-full bg-[#5BE4B6]" /></div></div><div><div className="flex justify-between text-xs text-[#9EACBB]"><span>Quiz score</span><span>84%</span></div><div className="mt-2 h-1.5 rounded-full bg-[#1B2935]"><div className="h-full w-[84%] rounded-full bg-[#6E9BFF]" /></div></div><div className="grid grid-cols-2 gap-2 pt-1"><div className="rounded-xl bg-[#101A24] p-3"><div className="text-lg font-bold text-white">12</div><div className="mt-1 text-[10px] text-[#718194]">Day streak</div></div><div className="rounded-xl bg-[#101A24] p-3"><div className="text-lg font-bold text-white">6</div><div className="mt-1 text-[10px] text-[#718194]">Sessions</div></div></div></div></section><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Study focus</div><div className="mt-4 rounded-xl border border-[#263746] bg-[#101A24] p-3"><div className="text-xs font-semibold text-white">Next up</div><div className="mt-2 text-sm text-[#C5D0DB]">Cellular respiration</div><div className="mt-1 text-[10px] text-[#718194]">Biology · 25 min session</div></div><button type="button" className="mt-3 w-full rounded-xl bg-[#183B34] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8]">Resume study plan</button></section></aside>
        </div>
      </div>
    </div>
  );
}

const CAREER_MODES = ['Resume', 'Cover Letter', 'Interview', 'Job Search', 'Career Advice', 'Skills', 'LinkedIn', 'Applications'];

const CAREER_TOOLS = [
  ['Resume Builder', '/tools/ai/ai-resume-builder', FileText],
  ['Resume Analyzer', '/tools/ai/ai-resume-summary', Search],
  ['Cover Letter Generator', '/tools/ai/ai-cover-letter', PenLine],
  ['Interview Practice', '/tools/ai/ai-interview-practice', MessageCircleQuestion],
  ['Job Description Analyzer', '/tools/ai/ai-interview-questions', Target],
  ['LinkedIn Bio', '/tools/ai/ai-professional-bio', UserRound],
  ['Career Roadmap', '/tools/ai/ai-study-planner', Route],
  ['Skill Gap Analysis', '/tools/ai/ai-resume-bullet-points', ListChecks],
] as const;

function CareerHubWorkspace() {
  const [mode, setMode] = useState('Resume');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'coach'; text: string }>>([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [role, setRole] = useState(() => readPreference('career-role', 'Not specified'));
  const [experience, setExperience] = useState(() => readPreference('career-experience', 'Not specified'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.pdf,application/pdf';
    input.style.display = 'none';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try { const text = await file.text(); setResumeText(text); setResumeUploaded(true); setPrompt((current) => current || 'Review my uploaded resume and suggest improvements.'); } catch { setError('Unable to read that resume file.'); }
    };
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('button');
      if (!button) return;
      const text = button.textContent?.trim() ?? '';
      if (text.includes('Upload CV') || button.getAttribute('aria-label') === 'Upload document') input.click();
      if (text === 'Career progress') setPrompt('Review my career progress and recommend my next three actions.');
      if (text === 'Product Design') { const values = ['Not specified', 'Product Design', 'Software Engineering', 'Marketing']; const value = values[(values.indexOf(role) + 1) % values.length]; setRole(value); writePreference('career-role', value); }
      if (text === 'Mid-level') { const values = ['Not specified', 'Entry-level', 'Mid-level', 'Senior']; const value = values[(values.indexOf(experience) + 1) % values.length]; setExperience(value); writePreference('career-experience', value); }
    };
    document.addEventListener('click', onClick, true);
    document.body.appendChild(input);
    return () => { document.removeEventListener('click', onClick, true); input.remove(); };
  }, [experience, role]);

  const askCoach = async () => {
    const value = prompt.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const answer = await generateHubResponse('career', { prompt: `${value}${resumeText ? `\n\nUploaded resume:\n${resumeText}` : ''}`, mode, role, industry: 'Not specified', experience });
      setMessages((current) => [...current, { role: 'user', text: value }, { role: 'coach', text: answer }]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the career coach.');
    } finally {
      setLoading(false);
    }
  };

  const evaluateInterview = async () => {
    const answer = interviewAnswer.trim();
    if (!answer || loading) { if (!answer) setError('Write an interview answer before evaluating it.'); return; }
    setLoading(true);
    setError('');
    try {
      const feedback = await generateHubResponse('career', { prompt: `Evaluate this interview answer and give a score out of 10, strengths, improvements, and a stronger example answer.\n\nQuestion: Tell me about a product decision you are proud of.\nAnswer: ${answer}`, mode: 'Interview', role, experience });
      setMessages((current) => [...current, { role: 'user', text: answer }, { role: 'coach', text: feedback }]);
      setInterviewAnswer('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to evaluate the answer.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const answerField = Array.from(document.querySelectorAll('textarea')).find((field) => field.getAttribute('placeholder') === 'Type your answer…');
    const evaluateButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Evaluate answer');
    if (!answerField || !evaluateButton) return;
    const onInput = () => setInterviewAnswer(answerField.value);
    const onClick = () => void evaluateInterview();
    answerField.addEventListener('input', onInput);
    evaluateButton.addEventListener('click', onClick);
    return () => { answerField.removeEventListener('input', onInput); evaluateButton.removeEventListener('click', onClick); };
  }, [evaluateInterview, interviewStarted, interviewAnswer]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#080C11] text-white"><div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">{error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="text-red-200 hover:text-white"><X className="h-4 w-4" /></button></div>}
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1B2935] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BriefcaseBusiness className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Career Hub</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Build your career, improve your skills and land better opportunities.</p></div></div><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-xs font-semibold text-[#A9F2D8] hover:border-[#3DDBC0]/60"><Target className="h-3.5 w-3.5 text-[#5BE4B6]" />Career progress</button></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-5"><section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6"><div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">AI career coach</div><h2 className="mt-1 text-2xl font-bold text-white">What career goal are you working toward?</h2></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#263746] bg-[#0A1118] p-4 text-sm leading-6 text-[#8492A3]">Tell me your target role, share a job description, or upload your resume. I’ll help you move from where you are to what’s next.</div> : <div className="mb-5 max-h-[380px] space-y-4 overflow-y-auto rounded-2xl border border-[#1B2935] bg-[#0A1118] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#263746] bg-[#101A24] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1B2935] pb-3 [scrollbar-width:none]">{CAREER_MODES.map((careerMode) => <button key={careerMode} type="button" onClick={() => setMode(careerMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === careerMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#101A24] text-[#8492A3] hover:text-white'}`}>{careerMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#0A1118] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askCoach(); } }} rows={4} placeholder="Tell me what you need help with…" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B2935] pt-3"><div className="flex items-center gap-1"><button type="button" onClick={() => setResumeUploaded(true)} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${resumeUploaded ? 'text-[#5BE4B6]' : 'text-[#91A0B0]'} hover:bg-[#16242E] hover:text-white`}><Upload className="h-3.5 w-3.5" />{resumeUploaded ? 'CV uploaded' : 'Upload CV'}</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload document"><FileText className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Product Design <ChevronDown className="h-3 w-3" /></button><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Mid-level <ChevronDown className="h-3 w-3" /></button><button type="button" onClick={askCoach} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask career coach"><ArrowUp className="h-4 w-4" /></button></div></div></div>{resumeUploaded && <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">ATS analysis</button><button type="button" className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">Missing keywords</button><button type="button" className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">Formatting suggestions</button><button type="button" className="rounded-xl bg-[#183B34] px-3 py-2 text-xs font-semibold text-[#A9F2D8]">Improve Resume</button></div>}</section><section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Career tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CAREER_TOOLS.map(([label, href, Icon]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1B2935] bg-[#0D151E] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section></main><aside className="space-y-5"><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Career dashboard</div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#101A24] p-3"><div className="text-xl font-black text-white">82</div><div className="mt-1 text-[10px] text-[#718194]">Resume score</div></div><div className="rounded-xl bg-[#101A24] p-3"><div className="text-xl font-black text-white">14</div><div className="mt-1 text-[10px] text-[#718194]">Applications</div></div><div className="rounded-xl bg-[#101A24] p-3"><div className="text-xl font-black text-white">6</div><div className="mt-1 text-[10px] text-[#718194]">Interviews</div></div><div className="rounded-xl bg-[#101A24] p-3"><div className="text-xl font-black text-white">64%</div><div className="mt-1 text-[10px] text-[#718194]">Skills progress</div></div></div><div className="mt-4 rounded-xl border border-[#263746] bg-[#101A24] p-3"><div className="text-[10px] uppercase tracking-[0.15em] text-[#718194]">Career goal</div><div className="mt-2 text-sm font-semibold text-white">Senior Product Designer</div><div className="mt-1 text-xs text-[#8492A3]">Next milestone: portfolio review</div></div></section><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Interview practice</div><span className="text-xs text-[#718194]">{interviewStarted ? 'In progress' : 'Ready'}</span></div>{interviewStarted ? <div><div className="rounded-xl border border-[#263746] bg-[#101A24] p-3 text-sm leading-6 text-[#C5D0DB]">Tell me about a product decision you are proud of.</div><textarea placeholder="Type your answer…" className="mt-3 min-h-20 w-full resize-none rounded-xl border border-[#263746] bg-[#0A1118] p-3 text-xs text-white outline-none placeholder:text-[#718194]" /><button type="button" className="mt-3 w-full rounded-xl bg-[#183B34] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8]">Evaluate answer</button></div> : <><p className="text-xs leading-5 text-[#8492A3]">Practice role-specific questions and get a score with actionable feedback.</p><button type="button" onClick={() => setInterviewStarted(true)} className="mt-4 w-full rounded-xl bg-[#10B981] px-3 py-2.5 text-xs font-semibold text-[#04120D]">Start interview</button></>}</section></aside></div>
    </div></div>
  );
}

const BUSINESS_MODES = [
  ['Ideas', 'Turn rough ideas into clear opportunities and next steps.', '💡'],
  ['Research', 'Explore customers, markets, competitors, and evidence.', '📊'],
  ['Build', 'Shape plans, campaigns, offers, and business documents.', '📝'],
  ['Money', 'Work through pricing, budgets, revenue, and financial choices.', '💰'],
] as const;

function BusinessInsights({ onBack }: { onBack: () => void }) {
  const history = typeof window === 'undefined' ? [] : JSON.parse(window.localStorage.getItem('toolboxx_history_v1') ?? '[]') as Array<{ toolCategory?: string; createdAt?: string }>;
  const recent = history.filter((entry) => entry.toolCategory === 'ai' || entry.toolCategory === 'business').slice(0, 5);
  return <section className="mx-auto max-w-[1100px] px-3 py-5 sm:px-6 lg:px-8 lg:py-8"><div className="mb-6 flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5C05A]">Business dashboard</div><h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Business Insights</h1><p className="mt-2 text-sm text-[#91A0B0]">A focused view of your business activity and momentum.</p></div><button type="button" onClick={onBack} className="rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-xs font-semibold text-[#C5D0DB] hover:text-white">Back to chat</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">AI sessions</div><div className="mt-2 text-2xl font-black text-white">{history.length}</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Projects</div><div className="mt-2 text-2xl font-black text-white">3</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Plan progress</div><div className="mt-2 text-2xl font-black text-[#5BE4B6]">68%</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Active focus</div><div className="mt-2 text-2xl font-black text-[#F5C05A]">Build</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-5"><div className="text-sm font-bold text-white">Project progress</div><div className="mt-5 space-y-4">{[['Q3 launch plan', 78], ['Customer growth strategy', 54], ['Freelance proposal', 32]].map(([name, value]) => <div key={name as string}><div className="flex justify-between text-xs text-[#C5D0DB]"><span>{name}</span><span>{value}%</span></div><div className="mt-2 h-2 rounded-full bg-[#1B2935]"><div className="h-full rounded-full bg-gradient-to-r from-[#F5C05A] to-[#5BE4B6]" style={{ width: `${value}%` }} /></div></div>)}</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#0D151E] p-5"><div className="text-sm font-bold text-white">Recent activity</div>{recent.length ? <div className="mt-4 space-y-3">{recent.map((entry, index) => <div key={`${entry.createdAt}-${index}`} className="flex items-center justify-between text-xs text-[#C5D0DB]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#F5C05A]" />Business AI session</span><span className="text-[#718194]">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Recent'}</span></div>)}</div> : <p className="mt-4 text-xs text-[#718194]">Complete a Business AI session to see activity here.</p>}</div></div></section>;
}

const BUSINESS_TOOLS = [
  ['Business Plan Generator', '/tools/business/ai-business-name', FileText],
  ['Marketing Plan', '/tools/ai/ai-landing-page-copy-generator', BarChart3],
  ['Ad Copy Generator', '/tools/ai/ai-ad-copy-generator', Sparkles],
  ['Social Media Planner', '/tools/ai/ai-instagram-caption', Captions],
  ['Email Generator', '/tools/ai/ai-email-writer', MessageCircleQuestion],
  ['Proposal Generator', '/tools/business/ai-product-description', FileText],
  ['SWOT Analysis', '/tools/ai/ai-business-name', Target],
  ['Competitor Analysis', '/tools/ai/ai-keyword-generator', Search],
  ['Invoice Generator', '/tools/business/invoice-generator', FileText],
] as const;

function BusinessHubWorkspace() {
  const [mode, setMode] = useState('Business Plan');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'consultant'; text: string }>>([]);
  const [projectSaved, setProjectSaved] = useState(false);
  const [businessType, setBusinessType] = useState(() => readPreference('business-type', 'SaaS business'));
  const [industry, setIndustry] = useState(() => readPreference('business-industry', 'Technology'));
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.csv,.pdf,application/pdf';
    input.style.display = 'none';
    input.onchange = () => setAttachment(input.files?.[0]?.name ?? '');
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('button');
      if (!button) return;
      const text = button.textContent?.trim() ?? '';
      if (button.getAttribute('aria-label') === 'Attach business document') input.click();
      if (text.startsWith('SaaS business')) { const values = ['SaaS business', 'E-commerce', 'Agency', 'Nonprofit']; const value = values[(values.indexOf(businessType) + 1) % values.length]; setBusinessType(value); writePreference('business-type', value); }
      if (text.startsWith('Technology')) { const values = ['Technology', 'Healthcare', 'Education', 'Finance']; const value = values[(values.indexOf(industry) + 1) % values.length]; setIndustry(value); writePreference('business-industry', value); }
      if (text === 'View all') setError('All saved projects are available through the current workspace session.');
      if (text === 'Continue') setPrompt('Continue this project and define the next three actions: ');
      if (text.includes('New business project')) { setProjectSaved(false); setPrompt('New business project: '); }
    };
    document.addEventListener('click', onClick, true);
    document.body.appendChild(input);
    return () => { document.removeEventListener('click', onClick, true); input.remove(); };
  }, [businessType, industry]);

  const askConsultant = async () => {
    const value = prompt.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    try {
      const answer = await generateHubResponse('business', { prompt: `${value}${attachment ? `\nAttached document: ${attachment}` : ''}`, mode, businessType, industry });
      setMessages((current) => [...current, { role: 'user', text: value }, { role: 'consultant', text: answer }]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the business consultant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#080C11] text-white"><div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">{error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="text-red-200 hover:text-white"><X className="h-4 w-4" /></button></div>}
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1B2935] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BriefcaseBusiness className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Business Hub</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Plan, market and grow your business with AI.</p></div></div><button type="button" onClick={() => setProjectSaved(true)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${projectSaved ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-[#263746] bg-[#101A24] text-[#A9F2D8] hover:border-[#3DDBC0]/60'}`}><Bookmark className="h-3.5 w-3.5" />{projectSaved ? 'Project saved' : 'Save project'}</button></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-5"><section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6"><div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business AI consultant</div><h2 className="mt-1 text-2xl font-bold text-white">What are you working on today?</h2></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#263746] bg-[#0A1118] p-4 text-sm leading-6 text-[#8492A3]">Ask about your business, marketing, customers or strategy. Start with an idea and move naturally from research to execution.</div> : <div className="mb-5 max-h-[390px] space-y-4 overflow-y-auto rounded-2xl border border-[#1B2935] bg-[#0A1118] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#263746] bg-[#101A24] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1B2935] pb-3 [scrollbar-width:none]">{BUSINESS_MODES.map((businessMode) => <button key={businessMode} type="button" onClick={() => setMode(businessMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === businessMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#101A24] text-[#8492A3] hover:text-white'}`}>{businessMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#0A1118] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askConsultant(); } }} rows={4} placeholder="Ask about your business, marketing, customers or strategy…" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B2935] pt-3"><div className="flex items-center gap-2"><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Attach business document"><Paperclip className="h-4 w-4" /></button><button type="button" className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white">SaaS business <ChevronDown className="ml-1 inline h-3 w-3" /></button><button type="button" className="hidden rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline">Technology <ChevronDown className="ml-1 inline h-3 w-3" /></button></div><button type="button" onClick={askConsultant} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask business consultant"><ArrowUp className="h-4 w-4" /></button></div></div>{messages.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{['Improve', 'Expand', 'Turn into plan', 'Create campaign', 'Generate social posts'].map((action) => <button key={action} type="button" onClick={() => setPrompt(`${action}: `)} className="rounded-lg border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8]">{action}</button>)}</div>}</section><section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BUSINESS_TOOLS.map(([label, href, Icon]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1B2935] bg-[#0D151E] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section></main><aside className="space-y-5"><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">AI workflow</div><div className="flex flex-wrap gap-2">{['Idea', 'Research', 'Strategy', 'Content', 'Marketing', 'Execution'].map((step, index) => <div key={step} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] ${index === 0 ? 'bg-[#16483D] text-[#A9F2D8]' : 'bg-[#101A24] text-[#8492A3]'}`}><span className="text-[10px]">{index + 1}</span>{step}</div>)}</div><p className="mt-4 text-xs leading-5 text-[#8492A3]">Move from a rough thought to a clear plan, then turn it into content and actions.</p></section><section className="rounded-[24px] border border-[#1B2935] bg-[#0D151E] p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business projects</div><button type="button" className="text-xs text-[#7EEAC9]">View all</button></div><div className="space-y-3">{['Q3 launch plan', 'Freelance proposal', 'Customer growth strategy'].map((project, index) => <div key={project} className="rounded-xl border border-[#263746] bg-[#101A24] p-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0 truncate text-xs font-semibold text-white">{project}</div><button type="button" className="shrink-0 rounded-lg px-2 py-1 text-[10px] text-[#A9F2D8] hover:bg-[#183B34]">Continue</button></div><div className="mt-2 text-[10px] text-[#718194]">{index + 1}h ago · {index === 0 ? 'Strategy' : 'Project'}</div></div>)}</div><button type="button" onClick={() => setProjectSaved(true)} className="mt-3 w-full rounded-xl border border-dashed border-[#315046] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8] hover:bg-[#142B2B]">+ New business project</button></section></aside></div>
    </div></div>
  );
}

const CREATOR_MODES = [
  ['Image', ImagePlus],
  ['Video', Film],
  ['Script', FileText],
  ['Audio', AudioLines],
  ['Social Post', Captions],
  ['Thumbnail', Image],
] as const;

const CREATOR_TOOLS = [
  ['Crop', Crop], ['Resize', SlidersHorizontal], ['Trim', Scissors], ['Text', FileText],
  ['Captions', Captions], ['Filters', Layers3], ['Remove BG', Eraser], ['Adjust', SlidersHorizontal],
  ['Audio trim', Scissors], ['Volume', Volume2], ['Voiceover', Mic], ['Music', Music2], ['Transitions', Film],
] as const;

function CreatorStudioWorkspace() {
  const [mode, setMode] = useState('Image');
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [aiEdit, setAiEdit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState('Cinematic');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.txt,.pdf';
    input.style.display = 'none';
    const onChange = () => setMediaFile(input.files?.[0] ?? null);
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      if (target.closest('button[aria-label="Upload media"]') || button?.textContent?.includes('Reference')) input.click();
      if (button?.getAttribute('aria-label') === 'Play preview' && generatedText) downloadText(`creator-${mode.toLowerCase()}.txt`, generatedText);
      if (button?.getAttribute('aria-label') === 'Preview options' && generatedText) downloadText(`creator-${mode.toLowerCase()}-export.txt`, generatedText);
      if (button?.textContent?.trim() === 'Apply') {
        const instruction = aiEdit.trim();
        if (instruction) { setGeneratedText((current) => `${current}\n\nApplied edit: ${instruction}`.trim()); setGenerated(true); setAiEdit(''); }
        else setError('Describe the edit you want to apply.');
      }
      const toolLabel = button?.textContent?.trim();
      if (toolLabel && CREATOR_TOOLS.some(([label]) => label === toolLabel)) setPrompt((current) => `${current}${current ? '\n' : ''}${toolLabel} edit: `);
    };
    input.addEventListener('change', onChange);
    document.addEventListener('click', onClick, true);
    document.body.appendChild(input);
    return () => { input.removeEventListener('change', onChange); document.removeEventListener('click', onClick, true); input.remove(); };
  }, [generatedText, mode, aiEdit]);

  useEffect(() => {
    if (generated && !generatedText && prompt.trim() && !loading) void generateCreatorAsset();
  }, [generated, generatedText, loading, prompt]);

  const generateCreatorAsset = async () => {
    const value = prompt.trim();
    if (!value) {
      setError('Describe what you want to create first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const answer = await generateHubResponse('creator', { prompt: `${value}\nAspect ratio: ${aspectRatio}\nStyle: ${style}${mediaFile ? `\nReference file: ${mediaFile.name}` : ''}`, mode });
      setGeneratedText(answer);
      setGenerated(true);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate this asset.');
    } finally {
      setLoading(false);
    }
  };

  const applyAiEdit = () => {
    const instruction = aiEdit.trim();
    if (!instruction) { setError('Describe the edit you want to apply.'); return; }
    setGeneratedText((current) => `${current}\n\nApplied edit: ${instruction}`.trim());
    setGenerated(true);
    setAiEdit('');
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#080C11] text-white">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1B2935] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowRight className="h-4 w-4 rotate-180" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><Wand2 className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Creator Hub</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Create images, videos, scripts, audio and social content with AI.</p></div></div><div className="relative flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-xs text-[#A9F2D8] sm:flex"><Sparkles className="h-3.5 w-3.5 text-[#5BE4B6]" />240 credits</div><button type="button" onClick={() => setSettingsOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#263746] bg-[#101A24] text-[#91A0B0] hover:text-white" aria-label="Creator settings"><Settings2 className="h-4 w-4" /></button><SettingsPopover open={settingsOpen} onClose={() => setSettingsOpen(false)} value={style} onChange={setStyle} /></div></header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Create with AI</div><h2 className="mt-1 text-xl font-bold text-white">Bring your next idea to life</h2></div><span className="hidden items-center gap-1.5 text-xs text-[#718194] sm:flex"><span className="h-2 w-2 rounded-full bg-[#5BE4B6]" />Studio ready</span></div><div className="flex gap-2 overflow-x-auto border-b border-[#1B2935] pb-3 [scrollbar-width:none]">{CREATOR_MODES.map(([label, Icon]) => <button key={label} type="button" onClick={() => setMode(label)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${mode === label ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#101A24] text-[#8492A3] hover:border-[#263746] hover:text-white'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><div className="mt-5 rounded-2xl border border-[#29413F] bg-[#0A1118] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="Describe what you want to create…" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B2935] pt-3"><div className="flex items-center gap-1"><button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#91A0B0] hover:bg-[#16242E] hover:text-white"><Paperclip className="h-3.5 w-3.5" />Reference</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload media"><ImagePlus className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><span className="text-[11px] text-[#718194]">{mode} settings</span><button type="button" onClick={() => setGenerated(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-[#04120D] transition hover:bg-[#34D399]"><Sparkles className="h-3.5 w-3.5" />Generate</button></div></div></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" className="rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-left text-xs text-[#C5D0DB]">Aspect ratio <span className="mt-1 block text-[10px] text-[#718194]">16:9 ▾</span></button><button type="button" className="rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-left text-xs text-[#C5D0DB]">Style <span className="mt-1 block text-[10px] text-[#718194]">Cinematic ▾</span></button><button type="button" className="rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-left text-xs text-[#C5D0DB]">Duration <span className="mt-1 block text-[10px] text-[#718194]">15 sec ▾</span></button><button type="button" className="rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2 text-left text-xs text-[#C5D0DB]">Voice / audio <span className="mt-1 block text-[10px] text-[#718194]">Studio ▾</span></button></div></section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"><div className="flex min-h-[260px] flex-col rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Preview</div><div className="flex gap-1"><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label="Play preview"><Play className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label="Preview options"><MoreHorizontal className="h-3.5 w-3.5" /></button></div></div><div className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[#263746] ${generated ? 'bg-gradient-to-br from-[#16483D] via-[#152D39] to-[#33264D]' : 'bg-[#0A1118]'}`}><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(135deg, rgba(91,228,182,0.15) 25%, transparent 25%, transparent 50%, rgba(91,228,182,0.15) 50%, rgba(91,228,182,0.15) 75%, transparent 75%)', backgroundSize: '28px 28px' }} />{generated ? <div className="relative text-center"><Sparkles className="mx-auto h-8 w-8 text-[#5BE4B6]" /><p className="mt-3 text-sm font-semibold text-white">Your {mode.toLowerCase()} preview is ready</p><p className="mt-1 text-xs text-[#A9F2D8]">Edit the result or export when you are happy.</p></div> : <div className="relative text-center text-[#718194]"><ImagePlus className="mx-auto h-7 w-7" /><p className="mt-2 text-xs">Generated preview appears here</p></div>}</div></div><div className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 sm:p-5"><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Creator tools</div><div className="grid grid-cols-2 gap-2">{CREATOR_TOOLS.map(([label, Icon]) => <button key={label} type="button" className="flex items-center gap-2 rounded-xl border border-[#263746] bg-[#101A24] px-2.5 py-2 text-left text-[11px] text-[#AAB7C5] hover:border-[#3DDBC0]/60 hover:text-white"><Icon className="h-3.5 w-3.5 text-[#5BE4B6]" />{label}</button>)}</div></div></section>

            <section className="rounded-[26px] border border-[#40355D] bg-gradient-to-br from-[#292044] to-[#171728] p-4 sm:p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#B18AFF]" /><div className="text-sm font-bold text-white">AI Edit</div><span className="rounded-full bg-[#493A6B] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D6C8FF]">Natural language</span></div><div className="mt-3 flex gap-2"><input value={aiEdit} onChange={(event) => setAiEdit(event.target.value)} placeholder="Remove the background and add a cinematic city background." className="min-w-0 flex-1 rounded-xl border border-[#554575] bg-[#17142A] px-3 py-2.5 text-xs text-white outline-none placeholder:text-[#9A8BBE] focus:border-[#B18AFF]/70" /><button type="button" className="rounded-xl bg-[#8B6BDE] px-3 text-xs font-bold text-white hover:bg-[#9B7CED]">Apply</button></div></section>
          </main>

          <aside className="space-y-5"><section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 sm:p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Creation workflow</div><div className="space-y-3">{['Generate a script', 'Add voice or audio', 'Generate visuals', 'Combine everything', 'Add captions', 'Export'].map((step, index) => <div key={step} className="flex items-center gap-3 text-xs text-[#C5D0DB]"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-[#16483D] text-[#5BE4B6]' : 'bg-[#182532] text-[#718194]'}`}>{index + 1}</span>{step}</div>)}</div></section><section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Recent projects</div><button type="button" className="text-xs text-[#7EEAC9]">View all</button></div><div className="space-y-3">{['City launch reel', 'Spring campaign', 'Podcast teaser'].map((project, index) => <div key={project} className="flex items-center gap-3"><div className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-lg ${index === 0 ? 'bg-[#16483D]' : index === 1 ? 'bg-[#38274E]' : 'bg-[#20344B]'}`}><Image className="h-4 w-4 text-[#A9F2D8]" /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-white">{project}</div><div className="mt-1 text-[10px] text-[#718194]">{index + 1}h ago</div></div><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label={`Edit ${project}`}><PenLine className="h-3.5 w-3.5" /></button></div>)}</div></section><section className="rounded-[26px] border border-[#1B2935] bg-[#0D151E] p-4 sm:p-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Fast links</div><div className="mt-3 space-y-2"><Link href="/tools/ai/ai-instagram-caption" className="flex items-center justify-between rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2.5 text-xs text-[#C5D0DB]">Social captions <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link><Link href="/tools/ai/ai-youtube-title" className="flex items-center justify-between rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2.5 text-xs text-[#C5D0DB]">Video titles <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link><Link href="/tools/ai/ai-ad-copy-generator" className="flex items-center justify-between rounded-xl border border-[#263746] bg-[#101A24] px-3 py-2.5 text-xs text-[#C5D0DB]">Ad copy <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link></div></section></aside>
        </div>
      </div>
    </div>
  );
}

export default function HubWorkspace() {
  const [, params] = useRoute('/hub/:hub');
  const key = (params?.hub ?? 'ai') as HubKey;
  const hub = HUBS[key] ?? HUBS.ai;
  const Icon = hub.icon;

  if (key === 'ai') return <AiAssistantWorkspace />;
  if (key === 'creator') return <CreatorStudioWorkspace />;
  if (key === 'study') return <StudyHubWorkspace />;
  if (key === 'career') return <CareerHubWorkspace />;
  if (key === 'business') return <BusinessHubWorkspace />;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex items-center gap-3 text-sm text-[#8492A3]"><Link href="/" className="hover:text-white">Home</Link><ArrowRight className="h-4 w-4" /><span className="text-white">{hub.title}</span></div>
      <section className="overflow-hidden rounded-[28px] border border-[#1E2D3B] bg-[#0D1721] shadow-[0_20px_70px_rgba(0,0,0,0.25)]">
        <div className="border-b border-[#1E2D3B] bg-gradient-to-br from-[#142D35] via-[#101B28] to-[#0D1721] p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0A1118]" style={{ boxShadow: `0 0 28px ${hub.color}35` }}><Icon className="h-5 w-5" style={{ color: hub.color }} /></div>
          <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#718194]">Focused workspace</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">{hub.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9BA9B8]">{hub.description}</p>
        </div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-2xl border border-[#1E2D3B] bg-[#0A1118] p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#728194]">Start with a tool</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {hub.actions.map(([label, href]) => <Link key={label} href={href} className="group rounded-2xl border border-[#243544] bg-[#111D28] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-white">{label}</span><ArrowRight className="h-4 w-4 text-[#718194] transition group-hover:text-[#5BE4B6]" /></div><p className="mt-3 text-xs leading-5 text-[#8492A3]">Open this focused workflow.</p></Link>)}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[#2A3A48] bg-[#0D1822] p-5"><div className="text-sm font-semibold text-white">Your workspace is ready</div><p className="mt-2 text-sm leading-6 text-[#8492A3]">Choose a tool above to start. Your existing inputs and local history remain handled by the original tool pages.</p></div>
          </div>
          <div className="rounded-2xl border border-[#1E2D3B] bg-[#0A1118] p-5"><div className="text-xs font-bold uppercase tracking-[0.18em] text-[#728194]">Included</div><div className="mt-4 space-y-3">{['No account required', 'Browser-first workflows', 'Existing tool history', 'Fast, focused actions'].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-[#C5D0DB]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#153D38] text-[#5BE4B6]"><Check className="h-3 w-3" /></span>{item}</div>)}</div><Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#72EBC9] hover:text-white">Browse all tools <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </div>
  );
}
