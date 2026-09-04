import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowUp, ArrowRight, BarChart3, Bookmark, BookOpen, BriefcaseBusiness, Calculator, CalendarDays, Check, ChevronDown, Clock3, Code2, Copy, Download, FileText, FolderOpen, Image, Paperclip, Plus, Presentation, RotateCcw, Route, Search, Settings2, Sparkles, Target, ThumbsDown, ThumbsUp, Trash2, Trophy, TrendingUp, UserRound, Wand2, Video, Mic, AudioLines, Captions, Crop, Eraser, Film, ImagePlus, Layers3, ListChecks, MessageCircleQuestion, MoreHorizontal, Music2, PenLine, Play, Scissors, SlidersHorizontal, Upload, Volume2, X, Zap, type LucideIcon } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { generateHubResponse } from '@/lib/hub-ai';
import { openFeedbackForm } from '@/components/FeedbackButton';
import { ChatViewport } from '@/components/ChatViewport';

type HubAction = readonly [string, string];
type HubConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  actions: readonly HubAction[];
};

const HUBS = {
  ai: { title: 'Chat with PDF', description: 'Upload PDFs and analyze them with summaries, key insights, and focused document guidance.', icon: FileText, color: '#FF66B8', actions: [] as HubAction[] },
  creator: { title: 'Creator Studio', description: 'Turn rough ideas into polished content, campaigns, and social posts.', icon: Wand2, color: '#D1D5DB', actions: [] as HubAction[] },
  study: { title: 'Study Hub', description: 'Learn, practice, and build a study routine with focused AI guidance.', icon: FileText, color: '#5C8DFF', actions: [] as HubAction[] },
  career: { title: 'Career Path', description: 'Prepare for your next opportunity with focused AI guidance.', icon: FileText, color: '#A779FF', actions: [] as HubAction[] },
  business: { title: 'Personal Finance', description: 'Plan, research, and develop business ideas in one focused workspace.', icon: Wand2, color: '#F7B83B', actions: [] as HubAction[] },
  pdf: { title: 'PDF & Documents', description: 'A focused workspace for document planning and assistance.', icon: FileText, color: '#FF7777', actions: [] as HubAction[] },
  image: { title: 'Image Hub', description: 'A focused workspace for image planning and assistance.', icon: Image, color: '#F78BCB', actions: [] as HubAction[] },
  video: { title: 'Video Hub', description: 'A focused workspace for video planning and assistance.', icon: Video, color: '#48D9FF', actions: [] as HubAction[] },
  audio: { title: 'Audio Hub', description: 'A focused workspace for audio planning and assistance.', icon: Video, color: '#FA8080', actions: [] as HubAction[] },
  developer: { title: 'Developer Hub', description: 'A focused workspace for development planning and assistance.', icon: Code2, color: '#32D5B2', actions: [] as HubAction[] },
  calculator: { title: 'Calculator & Converter', description: 'A focused workspace for calculation planning and assistance.', icon: Code2, color: '#B39BFF', actions: [] as HubAction[] },
} satisfies Record<string, HubConfig>;

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
  return <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-3 shadow-none"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-white">Response style</span><button type="button" onClick={onClose} aria-label="Close settings" className="text-[#718194] hover:text-white"><X className="h-3.5 w-3.5" /></button></div><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-lg border border-[#1A1A1A] bg-[#000000] px-2 py-2 text-xs text-white"><option>Balanced</option><option>Concise</option><option>Detailed</option></select></div>;
}

const AI_QUICK_ACTIONS = ['Summarize PDF', 'Extract key points', 'Explain section', 'Compare docs', 'Turn into notes', 'Translate'];

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
          <header className="flex items-start justify-between gap-4 border-b border-[#1B2936] px-4 py-5 sm:px-8"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#245143] bg-[#103027] text-[#5BE4B6]"><FileText className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold tracking-tight text-white">Chat with PDF</h1><p className="mt-1 hidden truncate text-xs text-[#8492A3] sm:block sm:text-sm">Analyze PDFs, notes, and documents with clear summaries and focused AI guidance.</p></div></div><div className="relative flex shrink-0 gap-1"><button type="button" onClick={() => setSettingsOpen((open) => !open)} className="rounded-xl p-2.5 text-[#8190A0] hover:bg-[#13202A] hover:text-white" aria-label="Settings"><Settings2 className="h-4 w-4" /></button><SettingsPopover open={settingsOpen} onClose={() => setSettingsOpen(false)} value={responseStyle} onChange={(value) => { setResponseStyle(value); writePreference('ai-response-style', value); }} /></div></header>

          <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
              {messages.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-10 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#245143] bg-[#103027] text-[#5BE4B6] shadow-[0_0_35px_rgba(91,228,182,0.12)]"><FileText className="h-7 w-7" /></div><h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">What would you like to analyze?</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#8492A3]">Upload a document, paste a PDF summary, or ask a question about your file and I’ll break it down clearly.</p><div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">{[['Summarize this PDF', 'Get the key points and main takeaways'], ['Explain a section', 'Break down a complex chunk of text'], ['Turn notes into action', 'Convert reading into next steps'], ['Compare documents', 'Highlight differences and themes']].map(([title, description]) => <button key={title} type="button" onClick={() => setPrompt(`${title}: `)} className="rounded-2xl border border-[#1E2D3B] bg-[#0E151D] p-3 text-left transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><div className="text-xs font-semibold text-white">{title}</div><div className="mt-2 text-[10px] leading-4 text-[#718194]">{description}</div></button>)}</div></div> : <div className="space-y-6 py-4">{messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16453B] text-[#E4FFF6]' : 'border border-[#1E2D3B] bg-[#0E151D] text-[#CBD6E0]'}`}><ReactMarkdown components={{ pre: ({ children }) => <pre className="group relative my-3 overflow-x-auto rounded-xl border border-[#1A1A1A] bg-[#000000] p-3 text-xs leading-5">{children}<button type="button" onClick={() => copyMessage(message)} className="absolute right-2 top-2 rounded-lg bg-[#17232E] p-1.5 text-[#8FA0B2] hover:text-white" aria-label="Copy message"><Copy className="h-3.5 w-3.5" /></button></pre>, code: ({ children, className, ...props }) => <code className={`${className ?? ''} font-mono`} {...props}>{children}</code> }}>{message.content}</ReactMarkdown>{message.role === 'assistant' && <div className="mt-3 flex items-center gap-1 border-t border-[#1E2D3B] pt-2"><button type="button" onClick={() => copyMessage(message)} className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Copy response"><Copy className="h-3.5 w-3.5" /></button><button type="button" onClick={() => { const previous = messages[messages.findIndex((item) => item.id === message.id) - 1]; if (previous?.role === 'user') void sendMessage(previous.content); }} className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Regenerate response"><RotateCcw className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Like response"><ThumbsUp className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#748496] hover:bg-[#16222D] hover:text-white" aria-label="Dislike response"><ThumbsDown className="h-3.5 w-3.5" /></button>{copied === message.id && <span className="ml-2 text-[10px] text-[#5BE4B6]">Copied</span>}</div>}</div></div>)}</div>}

              <div className="sticky bottom-3 mt-auto pt-5">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{AI_QUICK_ACTIONS.map((action) => <button key={action} type="button" onClick={() => setActionPrompt(action)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${activeAction === action ? 'border-[#4FD9B0] bg-[#12352D] text-[#A9F2D8]' : 'border-[#1F2D3A] bg-[#0E151D] text-[#91A0B0] hover:border-[#3DDBC0]/60 hover:text-white'}`}>{action}</button>)}</div>
                {error && <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-200"><span>{error}</span><button type="button" onClick={() => void sendMessage()} className="font-semibold text-white underline">Retry</button></div>}
                {loading && <div className="mb-3 text-xs text-[#A9F2D8]">Toolbuxx AI is thinkingâ€¦</div>}
                <div className="rounded-2xl border border-[#2A3A48] bg-[#0E151D] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.3)] focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={3} placeholder="Ask anythingâ€¦" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-[#68798A]" /><div className="flex items-center justify-between gap-2 px-2 pb-1"><div className="flex items-center gap-1"><button type="button" onClick={() => setPrompt((current) => `${current}${current ? '\n' : ''}Attached file: `)} className="rounded-lg p-2 text-[#8190A0] hover:bg-[#17242F] hover:text-white" aria-label="Attach file"><Paperclip className="h-4 w-4" /></button><button type="button" onClick={() => setError('Voice input is not available in this browser. Use the text box instead.')} className="rounded-lg p-2 text-[#8190A0] hover:bg-[#17242F] hover:text-white" aria-label="Voice input"><Mic className="h-4 w-4" /></button><span className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB]">Toolbuxx AI</span></div><div className="flex items-center gap-1"><span className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB]">{responseStyle}</span><button type="button" onClick={() => void sendMessage()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981] text-[#061410] transition hover:bg-[#34D399]" aria-label="Send message"><ArrowUp className="h-4 w-4" /></button></div></div></div>
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
    <div className="min-h-[calc(100vh-76px)] bg-[#000000] text-white">
      {progressOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"><section className="w-full max-w-sm rounded-2xl border border-[#1A1A1A] bg-[#000000] p-5 shadow-none"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Study progress</h2><button type="button" onClick={() => setProgressOpen(false)} aria-label="Close progress" className="text-[#718194] hover:text-white"><X className="h-4 w-4" /></button></div><p className="mt-4 text-sm text-[#C5D0DB]">{sessions} completed study {sessions === 1 ? 'session' : 'sessions'} in this browser.</p><div className="mt-4 h-2 rounded-full bg-[#1B2935]"><div className="h-full rounded-full bg-[#5BE4B6]" style={{ width: `${Math.min(100, sessions * 10)}%` }} /></div></section></div>}
      <div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Study Hub</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Learn faster with your personal AI study assistant.</p></div></div><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs font-semibold text-[#A9F2D8] hover:border-[#3DDBC0]/60"><Target className="h-3.5 w-3.5 text-[#5BE4B6]" />Progress</button></header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 shadow-none sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Personal tutor</div><h2 className="mt-1 text-2xl font-bold text-white">What are you studying today?</h2></div><span className="hidden items-center gap-2 text-xs text-[#718194] sm:flex"><span className="h-2 w-2 rounded-full bg-[#5BE4B6]" />Tutor ready</span></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#1A1A1A] bg-[#000000] p-4 text-sm leading-6 text-[#8492A3]">Ask anything about a topic, upload your notes, or choose a study mode. Iâ€™ll explain concepts clearly and help you test yourself.</div> : <div className="mb-5 max-h-[390px] space-y-4 overflow-y-auto rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'student' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#1A1A1A] bg-[#0A0A0A] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1A1A1A] pb-3 [scrollbar-width:none]">{STUDY_MODES.map((studyMode) => <button key={studyMode} type="button" onClick={() => setMode(studyMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === studyMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#0A0A0A] text-[#8492A3] hover:text-white'}`}>{studyMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#000000] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askTutor(); } }} rows={4} placeholder="Ask a question, upload your notes, or tell me what you want to learnâ€¦" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1A1A] pt-3"><div className="flex items-center gap-1"><button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#91A0B0] hover:bg-[#16242E] hover:text-white"><Upload className="h-3.5 w-3.5" />Notes / PDF</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload image"><Image className="h-4 w-4" /></button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Voice input"><Mic className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Biology <ChevronDown className="h-3 w-3" /></button><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">College <ChevronDown className="h-3 w-3" /></button><button type="button" onClick={askTutor} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask tutor"><ArrowUp className="h-4 w-4" /></button></div></div></div>{messages.length > 0 && <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setPrompt('Simplify the explanation: ')} className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">Simplify explanation</button><button type="button" onClick={() => setPrompt('Test me on this topic: ')} className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">Test me</button><button type="button" className="inline-flex items-center gap-1 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]"><Bookmark className="h-3.5 w-3.5" />Save answer</button></div>}</section>

            <section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Study tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{STUDY_TOOLS.map(([label, Icon, href]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section>
          </main>

          <aside className="space-y-5"><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="mb-4 flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Your progress</div><div className="mt-2 text-2xl font-black text-white">This week</div></div><BookOpen className="h-5 w-5 text-[#5BE4B6]" /></div><div className="space-y-4"><div><div className="flex justify-between text-xs text-[#9EACBB]"><span>Topics studied</span><span>8</span></div><div className="mt-2 h-1.5 rounded-full bg-[#1B2935]"><div className="h-full w-[68%] rounded-full bg-[#5BE4B6]" /></div></div><div><div className="flex justify-between text-xs text-[#9EACBB]"><span>Quiz score</span><span>84%</span></div><div className="mt-2 h-1.5 rounded-full bg-[#1B2935]"><div className="h-full w-[84%] rounded-full bg-[#6E9BFF]" /></div></div><div className="grid grid-cols-2 gap-2 pt-1"><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-lg font-bold text-white">12</div><div className="mt-1 text-[10px] text-[#718194]">Day streak</div></div><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-lg font-bold text-white">6</div><div className="mt-1 text-[10px] text-[#718194]">Sessions</div></div></div></div></section><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Study focus</div><div className="mt-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-3"><div className="text-xs font-semibold text-white">Next up</div><div className="mt-2 text-sm text-[#C5D0DB]">Cellular respiration</div><div className="mt-1 text-[10px] text-[#718194]">Biology Â· 25 min session</div></div><button type="button" className="mt-3 w-full rounded-xl bg-[#183B34] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8]">Resume study plan</button></section></aside>
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
    const answerField = Array.from(document.querySelectorAll('textarea')).find((field) => field.getAttribute('placeholder') === 'Type your answerâ€¦');
    const evaluateButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Evaluate answer');
    if (!answerField || !evaluateButton) return;
    const onInput = () => setInterviewAnswer(answerField.value);
    const onClick = () => void evaluateInterview();
    answerField.addEventListener('input', onInput);
    evaluateButton.addEventListener('click', onClick);
    return () => { answerField.removeEventListener('input', onInput); evaluateButton.removeEventListener('click', onClick); };
  }, [evaluateInterview, interviewStarted, interviewAnswer]);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#000000] text-white"><div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">{error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="text-red-200 hover:text-white"><X className="h-4 w-4" /></button></div>}
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BriefcaseBusiness className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Career Path</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Build your career, improve your skills and land better opportunities.</p></div></div><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs font-semibold text-[#A9F2D8] hover:border-[#3DDBC0]/60"><Target className="h-3.5 w-3.5 text-[#5BE4B6]" />Career progress</button></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-5"><section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 shadow-none sm:p-6"><div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">AI career coach</div><h2 className="mt-1 text-2xl font-bold text-white">What career goal are you working toward?</h2></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#1A1A1A] bg-[#000000] p-4 text-sm leading-6 text-[#8492A3]">Tell me your target role, share a job description, or upload your resume. Iâ€™ll help you move from where you are to whatâ€™s next.</div> : <div className="mb-5 max-h-[380px] space-y-4 overflow-y-auto rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#1A1A1A] bg-[#0A0A0A] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1A1A1A] pb-3 [scrollbar-width:none]">{CAREER_MODES.map((careerMode) => <button key={careerMode} type="button" onClick={() => setMode(careerMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === careerMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#0A0A0A] text-[#8492A3] hover:text-white'}`}>{careerMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#000000] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askCoach(); } }} rows={4} placeholder="Tell me what you need help withâ€¦" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1A1A] pt-3"><div className="flex items-center gap-1"><button type="button" onClick={() => setResumeUploaded(true)} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${resumeUploaded ? 'text-[#5BE4B6]' : 'text-[#91A0B0]'} hover:bg-[#16242E] hover:text-white`}><Upload className="h-3.5 w-3.5" />{resumeUploaded ? 'CV uploaded' : 'Upload CV'}</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload document"><FileText className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Product Design <ChevronDown className="h-3 w-3" /></button><button type="button" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline-flex">Mid-level <ChevronDown className="h-3 w-3" /></button><button type="button" onClick={askCoach} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask career coach"><ArrowUp className="h-4 w-4" /></button></div></div></div>{resumeUploaded && <div className="mt-3 flex flex-wrap gap-2"><button type="button" className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">ATS analysis</button><button type="button" className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">Missing keywords</button><button type="button" className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">Formatting suggestions</button><button type="button" className="rounded-xl bg-[#183B34] px-3 py-2 text-xs font-semibold text-[#A9F2D8]">Improve Resume</button></div>}</section><section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Career tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{CAREER_TOOLS.map(([label, href, Icon]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section></main><aside className="space-y-5"><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Career dashboard</div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-xl font-black text-white">82</div><div className="mt-1 text-[10px] text-[#718194]">Resume score</div></div><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-xl font-black text-white">14</div><div className="mt-1 text-[10px] text-[#718194]">Applications</div></div><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-xl font-black text-white">6</div><div className="mt-1 text-[10px] text-[#718194]">Interviews</div></div><div className="rounded-xl bg-[#0A0A0A] p-3"><div className="text-xl font-black text-white">64%</div><div className="mt-1 text-[10px] text-[#718194]">Skills progress</div></div></div><div className="mt-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-3"><div className="text-[10px] uppercase tracking-[0.15em] text-[#718194]">Career goal</div><div className="mt-2 text-sm font-semibold text-white">Senior Product Designer</div><div className="mt-1 text-xs text-[#8492A3]">Next milestone: portfolio review</div></div></section><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Interview practice</div><span className="text-xs text-[#718194]">{interviewStarted ? 'In progress' : 'Ready'}</span></div>{interviewStarted ? <div><div className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-3 text-sm leading-6 text-[#C5D0DB]">Tell me about a product decision you are proud of.</div><textarea placeholder="Type your answerâ€¦" className="mt-3 min-h-20 w-full resize-none rounded-xl border border-[#1A1A1A] bg-[#000000] p-3 text-xs text-white outline-none placeholder:text-[#718194]" /><button type="button" className="mt-3 w-full rounded-xl bg-[#183B34] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8]">Evaluate answer</button></div> : <><p className="text-xs leading-5 text-[#8492A3]">Practice role-specific questions and get a score with actionable feedback.</p><button type="button" onClick={() => setInterviewStarted(true)} className="mt-4 w-full rounded-xl bg-[#10B981] px-3 py-2.5 text-xs font-semibold text-[#04120D]">Start interview</button></>}</section></aside></div>
    </div></div>
  );
}

const UNIFIED_BUSINESS_MODES = [
  ['Ideas', 'Turn rough ideas into clear opportunities and next steps.', 'ðŸ’¡'],
  ['Research', 'Explore customers, markets, competitors, and evidence.', 'ðŸ“Š'],
  ['Build', 'Shape plans, campaigns, offers, and business documents.', 'ðŸ“'],
  ['Money', 'Work through pricing, budgets, revenue, and financial choices.', 'ðŸ’°'],
] as const;

const BUSINESS_MODES = ['Business Plan', 'Marketing', 'Sales', 'Strategy', 'Customer Support', 'Finance', 'Research', 'Content'];

function BusinessInsights({ onBack }: { onBack: () => void }) {
  const history = typeof window === 'undefined' ? [] : JSON.parse(window.localStorage.getItem('toolboxx_history_v1') ?? '[]') as Array<{ toolCategory?: string; createdAt?: string }>;
  const recent = history.filter((entry) => entry.toolCategory === 'ai' || entry.toolCategory === 'business').slice(0, 5);
  return <section className="mx-auto max-w-[1100px] px-3 py-5 sm:px-6 lg:px-8 lg:py-8"><div className="mb-6 flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5C05A]">Business dashboard</div><h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Business Insights</h1><p className="mt-2 text-sm text-[#91A0B0]">A focused view of your business activity and momentum.</p></div><button type="button" onClick={onBack} className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs font-semibold text-[#C5D0DB] hover:text-white">Back to chat</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">AI sessions</div><div className="mt-2 text-2xl font-black text-white">{history.length}</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Projects</div><div className="mt-2 text-2xl font-black text-white">3</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Plan progress</div><div className="mt-2 text-2xl font-black text-[#5BE4B6]">68%</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-[#718194]">Active focus</div><div className="mt-2 text-2xl font-black text-[#F5C05A]">Build</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-5"><div className="text-sm font-bold text-white">Project progress</div><div className="mt-5 space-y-4">{[['Q3 launch plan', 78], ['Customer growth strategy', 54], ['Freelance proposal', 32]].map(([name, value]) => <div key={name as string}><div className="flex justify-between text-xs text-[#C5D0DB]"><span>{name}</span><span>{value}%</span></div><div className="mt-2 h-2 rounded-full bg-[#1B2935]"><div className="h-full rounded-full bg-gradient-to-r from-[#F5C05A] to-[#5BE4B6]" style={{ width: `${value}%` }} /></div></div>)}</div></div><div className="rounded-2xl border border-[#1D2B39] bg-[#000000] p-5"><div className="text-sm font-bold text-white">Recent activity</div>{recent.length ? <div className="mt-4 space-y-3">{recent.map((entry, index) => <div key={`${entry.createdAt}-${index}`} className="flex items-center justify-between text-xs text-[#C5D0DB]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#F5C05A]" />Business AI session</span><span className="text-[#718194]">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Recent'}</span></div>)}</div> : <p className="mt-4 text-xs text-[#718194]">Complete a Business AI session to see activity here.</p>}</div></div></section>;
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
    <div className="min-h-[calc(100vh-76px)] bg-[#000000] text-white"><div className="mx-auto max-w-[1420px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">{error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error" className="text-red-200 hover:text-white"><X className="h-4 w-4" /></button></div>}
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><BriefcaseBusiness className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Personal Finance</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Plan, market and grow your business with AI.</p></div></div><button type="button" onClick={() => setProjectSaved(true)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${projectSaved ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-[#1A1A1A] bg-[#0A0A0A] text-[#A9F2D8] hover:border-[#3DDBC0]/60'}`}><Bookmark className="h-3.5 w-3.5" />{projectSaved ? 'Project saved' : 'Save project'}</button></header>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><main className="min-w-0 space-y-5"><section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 shadow-none sm:p-6"><div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business AI consultant</div><h2 className="mt-1 text-2xl font-bold text-white">What are you working on today?</h2></div>{messages.length === 0 ? <div className="mb-5 rounded-2xl border border-dashed border-[#1A1A1A] bg-[#000000] p-4 text-sm leading-6 text-[#8492A3]">Ask about your business, marketing, customers or strategy. Start with an idea and move naturally from research to execution.</div> : <div className="mb-5 max-h-[390px] space-y-4 overflow-y-auto rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-[#16483D] text-[#E7FFF7]' : 'border border-[#1A1A1A] bg-[#0A0A0A] text-[#C5D0DB]'}`}>{message.text}</div></div>)}</div>}<div className="flex gap-2 overflow-x-auto border-b border-[#1A1A1A] pb-3 [scrollbar-width:none]">{BUSINESS_MODES.map((businessMode) => <button key={businessMode} type="button" onClick={() => setMode(businessMode)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === businessMode ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#0A0A0A] text-[#8492A3] hover:text-white'}`}>{businessMode}</button>)}</div><div className="mt-4 rounded-2xl border border-[#29413F] bg-[#000000] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askConsultant(); } }} rows={4} placeholder="Ask about your business, marketing, customers or strategyâ€¦" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1A1A] pt-3"><div className="flex items-center gap-2"><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Attach business document"><Paperclip className="h-4 w-4" /></button><button type="button" className="rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white">SaaS business <ChevronDown className="ml-1 inline h-3 w-3" /></button><button type="button" className="hidden rounded-lg px-2 py-1.5 text-[11px] text-[#9EACBB] hover:bg-[#16242E] hover:text-white sm:inline">Technology <ChevronDown className="ml-1 inline h-3 w-3" /></button></div><button type="button" onClick={askConsultant} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-[#04120D] hover:bg-[#34D399]" aria-label="Ask business consultant"><ArrowUp className="h-4 w-4" /></button></div></div>{messages.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{['Improve', 'Expand', 'Turn into plan', 'Create campaign', 'Generate social posts'].map((action) => <button key={action} type="button" onClick={() => setPrompt(`${action}: `)} className="rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8]">{action}</button>)}</div>}</section><section><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business tools</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BUSINESS_TOOLS.map(([label, href, Icon]) => <Link key={label} href={href} className="group rounded-2xl border border-[#1A1A1A] bg-[#000000] p-4 transition hover:-translate-y-0.5 hover:border-[#3DDBC0]/60"><Icon className="h-4 w-4 text-[#5BE4B6]" /><div className="mt-3 text-xs font-semibold text-white">{label}</div><div className="mt-2 flex items-center gap-1 text-[10px] text-[#718194] group-hover:text-[#A9F2D8]">Open tool <ArrowRight className="h-3 w-3" /></div></Link>)}</div></section></main><aside className="space-y-5"><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">AI workflow</div><div className="flex flex-wrap gap-2">{['Idea', 'Research', 'Strategy', 'Content', 'Marketing', 'Execution'].map((step, index) => <div key={step} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] ${index === 0 ? 'bg-[#16483D] text-[#A9F2D8]' : 'bg-[#0A0A0A] text-[#8492A3]'}`}><span className="text-[10px]">{index + 1}</span>{step}</div>)}</div><p className="mt-4 text-xs leading-5 text-[#8492A3]">Move from a rough thought to a clear plan, then turn it into content and actions.</p></section><section className="rounded-[24px] border border-[#1A1A1A] bg-[#000000] p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Business projects</div><button type="button" className="text-xs text-[#7EEAC9]">View all</button></div><div className="space-y-3">{['Q3 launch plan', 'Freelance proposal', 'Customer growth strategy'].map((project, index) => <div key={project} className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0 truncate text-xs font-semibold text-white">{project}</div><button type="button" className="shrink-0 rounded-lg px-2 py-1 text-[10px] text-[#A9F2D8] hover:bg-[#183B34]">Continue</button></div><div className="mt-2 text-[10px] text-[#718194]">{index + 1}h ago Â· {index === 0 ? 'Strategy' : 'Project'}</div></div>)}</div><button type="button" onClick={() => setProjectSaved(true)} className="mt-3 w-full rounded-xl border border-dashed border-[#315046] px-3 py-2.5 text-xs font-semibold text-[#A9F2D8] hover:bg-[#142B2B]">+ New business project</button></section></aside></div>
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
    <div className="min-h-[calc(100vh-76px)] bg-[#000000] text-white">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <header className="mb-5 flex items-center justify-between gap-4 border-b border-[#1A1A1A] pb-5"><div className="flex min-w-0 items-center gap-3"><Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Back to dashboard"><ArrowRight className="h-4 w-4 rotate-180" /></Link><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123B35] text-[#5BE4B6]"><Wand2 className="h-5 w-5" /></div><div className="min-w-0"><h1 className="truncate text-xl font-bold text-white">Creator Studio</h1><p className="hidden truncate text-sm text-[#8492A3] sm:block">Create images, videos, scripts, audio and social content with AI.</p></div></div><div className="relative flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-xs text-[#A9F2D8] sm:flex"><Sparkles className="h-3.5 w-3.5 text-[#5BE4B6]" />240 credits</div><button type="button" onClick={() => setSettingsOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] hover:text-white" aria-label="Creator settings"><Settings2 className="h-4 w-4" /></button><SettingsPopover open={settingsOpen} onClose={() => setSettingsOpen(false)} value={style} onChange={setStyle} /></div></header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 shadow-none sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Create with AI</div><h2 className="mt-1 text-xl font-bold text-white">Bring your next idea to life</h2></div><span className="hidden items-center gap-1.5 text-xs text-[#718194] sm:flex"><span className="h-2 w-2 rounded-full bg-[#5BE4B6]" />Studio ready</span></div><div className="flex gap-2 overflow-x-auto border-b border-[#1A1A1A] pb-3 [scrollbar-width:none]">{CREATOR_MODES.map(([label, Icon]) => <button key={label} type="button" onClick={() => setMode(label)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${mode === label ? 'border-[#3DDBC0]/60 bg-[#16483D] text-[#A9F2D8]' : 'border-transparent bg-[#0A0A0A] text-[#8492A3] hover:border-[#1A1A1A] hover:text-white'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div><div className="mt-5 rounded-2xl border border-[#29413F] bg-[#000000] p-3 focus-within:border-[#3DDBC0]/70"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="Describe what you want to createâ€¦" className="w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-white outline-none placeholder:text-[#718194]" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1A1A] pt-3"><div className="flex items-center gap-1"><button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[#91A0B0] hover:bg-[#16242E] hover:text-white"><Paperclip className="h-3.5 w-3.5" />Reference</button><button type="button" className="rounded-lg p-1.5 text-[#8190A0] hover:bg-[#16242E] hover:text-white" aria-label="Upload media"><ImagePlus className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><span className="text-[11px] text-[#718194]">{mode} settings</span><button type="button" onClick={() => setGenerated(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-[#04120D] transition hover:bg-[#34D399]"><Sparkles className="h-3.5 w-3.5" />Generate</button></div></div></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-left text-xs text-[#C5D0DB]">Aspect ratio <span className="mt-1 block text-[10px] text-[#718194]">16:9 â–¾</span></button><button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-left text-xs text-[#C5D0DB]">Style <span className="mt-1 block text-[10px] text-[#718194]">Cinematic â–¾</span></button><button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-left text-xs text-[#C5D0DB]">Duration <span className="mt-1 block text-[10px] text-[#718194]">15 sec â–¾</span></button><button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 text-left text-xs text-[#C5D0DB]">Voice / audio <span className="mt-1 block text-[10px] text-[#718194]">Studio â–¾</span></button></div></section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"><div className="flex min-h-[260px] flex-col rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Preview</div><div className="flex gap-1"><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label="Play preview"><Play className="h-3.5 w-3.5" /></button><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label="Preview options"><MoreHorizontal className="h-3.5 w-3.5" /></button></div></div><div className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[#1A1A1A] ${generated ? 'bg-gradient-to-br from-[#16483D] via-[#152D39] to-[#33264D]' : 'bg-[#000000]'}`}><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(135deg, rgba(91,228,182,0.15) 25%, transparent 25%, transparent 50%, rgba(91,228,182,0.15) 50%, rgba(91,228,182,0.15) 75%, transparent 75%)', backgroundSize: '28px 28px' }} />{generated ? <div className="relative text-center"><Sparkles className="mx-auto h-8 w-8 text-[#5BE4B6]" /><p className="mt-3 text-sm font-semibold text-white">Your {mode.toLowerCase()} preview is ready</p><p className="mt-1 text-xs text-[#A9F2D8]">Edit the result or export when you are happy.</p></div> : <div className="relative text-center text-[#718194]"><ImagePlus className="mx-auto h-7 w-7" /><p className="mt-2 text-xs">Generated preview appears here</p></div>}</div></div><div className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 sm:p-5"><div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Creator tools</div><div className="grid grid-cols-2 gap-2">{CREATOR_TOOLS.map(([label, Icon]) => <button key={label} type="button" className="flex items-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-2.5 py-2 text-left text-[11px] text-[#AAB7C5] hover:border-[#3DDBC0]/60 hover:text-white"><Icon className="h-3.5 w-3.5 text-[#5BE4B6]" />{label}</button>)}</div></div></section>

            <section className="rounded-[26px] border border-[#40355D] bg-gradient-to-br from-[#292044] to-[#171728] p-4 sm:p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#B18AFF]" /><div className="text-sm font-bold text-white">AI Edit</div><span className="rounded-full bg-[#493A6B] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D6C8FF]">Natural language</span></div><div className="mt-3 flex gap-2"><input value={aiEdit} onChange={(event) => setAiEdit(event.target.value)} placeholder="Remove the background and add a cinematic city background." className="min-w-0 flex-1 rounded-xl border border-[#554575] bg-[#17142A] px-3 py-2.5 text-xs text-white outline-none placeholder:text-[#9A8BBE] focus:border-[#B18AFF]/70" /><button type="button" className="rounded-xl bg-[#8B6BDE] px-3 text-xs font-bold text-white hover:bg-[#9B7CED]">Apply</button></div></section>
          </main>

          <aside className="space-y-5"><section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 sm:p-5"><div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Creation workflow</div><div className="space-y-3">{['Generate a script', 'Add voice or audio', 'Generate visuals', 'Combine everything', 'Add captions', 'Export'].map((step, index) => <div key={step} className="flex items-center gap-3 text-xs text-[#C5D0DB]"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-[#16483D] text-[#5BE4B6]' : 'bg-[#182532] text-[#718194]'}`}>{index + 1}</span>{step}</div>)}</div></section><section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Recent projects</div><button type="button" className="text-xs text-[#7EEAC9]">View all</button></div><div className="space-y-3">{['City launch reel', 'Spring campaign', 'Podcast teaser'].map((project, index) => <div key={project} className="flex items-center gap-3"><div className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-lg ${index === 0 ? 'bg-[#16483D]' : index === 1 ? 'bg-[#38274E]' : 'bg-[#20344B]'}`}><Image className="h-4 w-4 text-[#A9F2D8]" /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-white">{project}</div><div className="mt-1 text-[10px] text-[#718194]">{index + 1}h ago</div></div><button type="button" className="rounded-lg p-1.5 text-[#718194] hover:bg-[#16242E] hover:text-white" aria-label={`Edit ${project}`}><PenLine className="h-3.5 w-3.5" /></button></div>)}</div></section><section className="rounded-[26px] border border-[#1A1A1A] bg-[#000000] p-4 sm:p-5"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">Fast links</div><div className="mt-3 space-y-2"><Link href="/tools/ai/ai-instagram-caption" className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2.5 text-xs text-[#C5D0DB]">Social captions <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link><Link href="/tools/ai/ai-youtube-title" className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2.5 text-xs text-[#C5D0DB]">Video titles <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link><Link href="/tools/ai/ai-ad-copy-generator" className="flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2.5 text-xs text-[#C5D0DB]">Ad copy <ArrowRight className="h-3.5 w-3.5 text-[#718194]" /></Link></div></section></aside>
        </div>
      </div>
    </div>
  );
}

type UnifiedHubConfig = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  tools: readonly HubAction[];
  modes: readonly HubAction[];
};

const UNIFIED_HUBS = {
  ai: {
    title: 'Chat with PDF',
    subtitle: 'Upload PDFs and get clear summaries, insights, and document guidance in one focused workspace.',
    icon: FileText,
    color: '#FF66B8',
    tools: [] as HubAction[],
    modes: [['Summarize', 'Pull out the core conclusions and main ideas.'], ['Explain', 'Break down complex sections into clear language.'], ['Compare', 'Highlight the key differences across documents.'], ['Turn into notes', 'Convert the content into practical takeaways.']],
  },
  creator: {
    title: 'Creator Studio',
    subtitle: 'Create polished content, campaigns, and creative direction with AI.',
    icon: Wand2,
    color: '#D1D5DB',
    tools: [] as HubAction[],
    modes: [['Create', 'Turn an idea into production-ready content.'], ['Plan', 'Shape a clear creative brief and direction.'], ['Polish', 'Improve tone, structure, and clarity.'], ['Repurpose', 'Adapt one idea for multiple formats.']],
  },
  study: {
    title: 'Study Hub',
    subtitle: 'Learn faster with a focused AI tutor for understanding and practice.',
    icon: BookOpen,
    color: '#5C8DFF',
    tools: [] as HubAction[],
    modes: [['Explain', 'Break down a difficult topic step by step.'], ['Summarize', 'Turn notes into a clear revision guide.'], ['Practice', 'Test understanding with useful questions.'], ['Plan', 'Build a realistic study routine.']],
  },
  career: {
    title: 'Career Path',
    subtitle: 'Prepare stronger applications and make confident career decisions with AI.',
    icon: BriefcaseBusiness,
    color: '#A779FF',
    tools: [] as HubAction[],
    modes: [['Resume', 'Strengthen experience and achievement statements.'], ['Cover Letter', 'Write a specific, persuasive application.'], ['Interview', 'Practice answers and improve your delivery.'], ['Career Advice', 'Turn your next goal into an action plan.']],
  },
  business: {
    title: 'Personal Finance',
    subtitle: 'Think, plan, and execute business ideas in one focused AI workspace.',
    icon: BarChart3,
    color: '#F7B83B',
    tools: [] as HubAction[],
    modes: [['Ideas', 'Turn rough thoughts into clear opportunities.'], ['Research', 'Explore customers, markets, and competitors.'], ['Build', 'Create plans, campaigns, and business documents.'], ['Money', 'Work through pricing, budgets, and revenue.']],
  },
} satisfies Record<string, UnifiedHubConfig>;

type CareerSidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const CAREER_SIDEBAR_GROUPS: Array<{ label?: string; items: CareerSidebarItem[] }> = [
  { items: [{ id: 'chat', label: 'New Chat', icon: Plus }] },
  { label: 'Main', items: [
    { id: 'dashboard', label: 'Career Dashboard', icon: BriefcaseBusiness },
    { id: 'assessment', label: 'Career Assessment', icon: Target },
    { id: 'roadmap', label: 'Career Roadmap', icon: Route },
    { id: 'roles', label: 'Role Explorer', icon: Search },
  ] },
  { label: 'Job Search', items: [
    { id: 'jobs', label: 'Find Jobs', icon: Search },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'alerts', label: 'Job Alerts', icon: Sparkles },
  ] },
  { label: 'Career Tools', items: [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'cover-letter', label: 'Cover Letter', icon: MessageCircleQuestion },
    { id: 'interview', label: 'Interview Prep', icon: MessageCircleQuestion },
    { id: 'skills', label: 'Skills Gap', icon: ListChecks },
  ] },
  { label: 'Progress', items: [
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'progress', label: 'Progress Tracker', icon: BarChart3 },
  ] },
  { label: 'Bottom', items: [
    { id: 'history', label: 'Chat History', icon: Clock3 },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ] },
];

function CareerPathSidebar({
  open,
  active,
  onClose,
  onSelect,
}: {
  open: boolean;
  active: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(84vw,272px)] flex-col border-r border-[#1A1A1A] bg-[#050505] px-3 py-4 transition-transform duration-200 md:relative md:z-0 md:w-[236px] md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-2 pb-4">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#4A2B72] bg-[#120B1B] text-[#C19AFF] transition hover:border-[#A779FF] hover:text-white" aria-label="Back to dashboard" title="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button type="button" onClick={onClose} className="md:hidden" aria-label="Close Career Path navigation">
            <X className="h-4 w-4 text-[#9BA6B5]" />
          </button>
        </div>
        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {CAREER_SIDEBAR_GROUPS.map((group, index) => (
            <div key={group.label ?? `start-${index}`} className={index === 0 ? '' : 'mt-5'}>
              {group.label && <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E6EB8]">{group.label}</div>}
              <div className="space-y-1">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { onSelect(id); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${active === id ? 'bg-[#2A1744] text-[#F2E9FF]' : 'text-[#A6B0BF] hover:bg-[#17101F] hover:text-white'}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active === id ? 'text-[#C19AFF]' : 'text-[#8A789B]'}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function CareerDestinationPlaceholder({ item }: { item: CareerSidebarItem }) {
  const Icon = item.icon;
  return (
    <section className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#315A9E] bg-[#112C5D] text-[#8EB2FF]"><Icon className="h-6 w-6" /></div>
      <h1 className="mt-5 text-2xl font-bold">{item.label}</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#8995A5]">This Career Path workspace is ready for your next step.</p>
    </section>
  );
}

const BUSINESS_SIDEBAR_GROUPS: Array<{ label?: string; items: CareerSidebarItem[] }> = [
  { label: 'Business', items: [
    { id: 'chat', label: 'New Chat', icon: Plus },
    { id: 'dashboard', label: 'Business Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Chat History', icon: Clock3 },
  ] },
  { label: 'Business Strategy', items: [
    { id: 'planner', label: 'Business Planner', icon: Route },
    { id: 'ideas', label: 'Business Ideas', icon: Sparkles },
    { id: 'model', label: 'Business Model', icon: BriefcaseBusiness },
    { id: 'research', label: 'Market Research', icon: Search },
    { id: 'competitors', label: 'Competitor Analysis', icon: Target },
    { id: 'swot', label: 'SWOT Analysis', icon: BarChart3 },
  ] },
  { label: 'Growth', items: [
    { id: 'marketing', label: 'Marketing', icon: Sparkles },
    { id: 'content', label: 'Content Strategy', icon: PenLine },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customer Growth', icon: UserRound },
    { id: 'growth-planner', label: 'Growth Planner', icon: Route },
  ] },
  { label: 'Finance', items: [
    { id: 'finance', label: 'Financial Planner', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue Calculator', icon: Calculator },
    { id: 'pricing', label: 'Pricing Strategy', icon: Target },
    { id: 'expenses', label: 'Expense Tracker', icon: FileText },
  ] },
  { label: 'Business Tools', items: [
    { id: 'business-plan', label: 'Business Plan', icon: FileText },
    { id: 'pitch-deck', label: 'Pitch Deck', icon: Presentation },
    { id: 'proposal', label: 'Proposal Builder', icon: PenLine },
    { id: 'outreach', label: 'Email & Outreach', icon: MessageCircleQuestion },
    { id: 'documents', label: 'Business Documents', icon: FolderOpen },
  ] },
  { label: 'Progress', items: [
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'progress', label: 'Business Progress', icon: Trophy },
  ] },
  { label: 'Bottom', items: [
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'help', label: 'Help', icon: MessageCircleQuestion },
  ] },
];

const CREATOR_SIDEBAR_GROUPS: Array<{ label?: string; items: CareerSidebarItem[] }> = [
  { label: 'Create', items: [
    { id: 'chat', label: 'New Chat', icon: Plus },
    { id: 'dashboard', label: 'Creator Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Chat History', icon: Clock3 },
  ] },
  { label: 'Content', items: [
    { id: 'ideas', label: 'Content Ideas', icon: Sparkles },
    { id: 'planner', label: 'Content Planner', icon: CalendarDays },
    { id: 'script', label: 'Script Writer', icon: FileText },
    { id: 'captions', label: 'Caption Generator', icon: Captions },
    { id: 'posts', label: 'Post Generator', icon: PenLine },
    { id: 'hooks', label: 'Hook Generator', icon: Zap },
    { id: 'stories', label: 'Story Generator', icon: BookOpen },
  ] },
  { label: 'Create & Edit', items: [
    { id: 'image', label: 'Image Studio', icon: Image },
    { id: 'video', label: 'Video Studio', icon: Video },
    { id: 'audio', label: 'Audio Studio', icon: AudioLines },
    { id: 'thumbnail', label: 'Thumbnail Maker', icon: ImagePlus },
    { id: 'editor', label: 'AI Editor', icon: Wand2 },
  ] },
  { label: 'Social Media', items: [
    { id: 'instagram', label: 'Instagram', icon: Image },
    { id: 'tiktok', label: 'TikTok', icon: Video },
    { id: 'youtube', label: 'YouTube', icon: Play },
    { id: 'twitter', label: 'X / Twitter', icon: MessageCircleQuestion },
    { id: 'linkedin', label: 'LinkedIn', icon: BriefcaseBusiness },
    { id: 'facebook', label: 'Facebook', icon: UserRound },
  ] },
  { label: 'Publishing', items: [
    { id: 'calendar', label: 'Content Calendar', icon: CalendarDays },
    { id: 'scheduled', label: 'Scheduled Posts', icon: Clock3 },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'published', label: 'Published Content', icon: Check },
  ] },
  { label: 'Analytics', items: [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'performance', label: 'Content Performance', icon: TrendingUp },
    { id: 'audience', label: 'Audience Insights', icon: UserRound },
    { id: 'growth', label: 'Growth Tracker', icon: Trophy },
  ] },
  { label: 'Brand', items: [
    { id: 'brand-kit', label: 'Brand Kit', icon: BriefcaseBusiness },
    { id: 'brand-voice', label: 'Brand Voice', icon: Mic },
    { id: 'prompts', label: 'Saved Prompts', icon: Bookmark },
    { id: 'templates', label: 'Templates', icon: Layers3 },
  ] },
  { label: 'Bottom', items: [
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'help', label: 'Help', icon: MessageCircleQuestion },
  ] },
];

function BusinessSidebar({
  open,
  active,
  onClose,
  onSelect,
}: {
  open: boolean;
  active: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} aria-hidden="true" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(84vw,272px)] flex-col border-r border-[#1A1A1A] bg-[#050505] px-3 py-4 transition-transform duration-200 md:relative md:z-0 md:w-[236px] md:shrink-0 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-2 pb-4">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5A431D] bg-[#1B1408] text-[#F5C05A] transition hover:border-[#F5C05A] hover:text-white" aria-label="Back to dashboard" title="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="mr-auto ml-3 min-w-0 text-sm font-semibold text-white">Business</div>
          <button type="button" onClick={onClose} className="md:hidden" aria-label="Close Business navigation">
            <X className="h-4 w-4 text-[#9BA6B5]" />
          </button>
        </div>
        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {BUSINESS_SIDEBAR_GROUPS.map((group, index) => (
            <div key={group.label ?? `business-start-${index}`} className={index === 0 ? '' : 'mt-5'}>
              {group.label && <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9B7A3B]">{group.label}</div>}
              <div className="space-y-1">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" title={label} onClick={() => { onSelect(id); onClose(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${active === id ? 'bg-[#3A2A10] text-[#FFF3D0]' : 'text-[#A6B0BF] hover:bg-[#17130D] hover:text-white'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${active === id ? 'text-[#F5C05A]' : 'text-[#8F8066]'}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function BusinessDestinationPlaceholder({ item, onBack }: { item: CareerSidebarItem; onBack: () => void }) {
  const Icon = item.icon;
  return (
    <section className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6A5125] bg-[#2A1E0B] text-[#F5C05A]"><Icon className="h-6 w-6" /></div>
      <h1 className="mt-5 text-2xl font-bold">{item.label}</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#8995A5]">This Business workspace is ready for your next step.</p>
      <button type="button" onClick={onBack} className="mt-6 rounded-lg border border-[#3A2A10] px-3 py-2 text-xs text-[#F5C05A] transition hover:bg-[#17130D]">Back to chat</button>
    </section>
  );
}

function CreatorSidebar({ open, active, onClose, onSelect }: { open: boolean; active: string; onClose: () => void; onSelect: (id: string) => void }) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={onClose} aria-hidden="true" />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(84vw,272px)] flex-col border-r border-[#1A1A1A] bg-[#050505] px-3 py-4 transition-transform duration-200 md:relative md:z-0 md:w-[236px] md:shrink-0 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-2 pb-4">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A3F46] bg-[#17191D] text-[#D1D5DB] transition hover:border-[#E5E7EB] hover:text-white" aria-label="Back to dashboard" title="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="mr-auto ml-3 min-w-0 text-sm font-semibold text-white">Creator Studio</div>
          <button type="button" onClick={onClose} className="md:hidden" aria-label="Close Creator Studio navigation"><X className="h-4 w-4 text-[#9BA6B5]" /></button>
        </div>
        <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {CREATOR_SIDEBAR_GROUPS.map((group, index) => <div key={group.label ?? `creator-start-${index}`} className={index === 0 ? '' : 'mt-5'}>
            {group.label && <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6FAE9A]">{group.label}</div>}
            <div className="space-y-1">{group.items.map(({ id, label, icon: Icon }) => <button key={id} type="button" title={label} onClick={() => { onSelect(id); onClose(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${active === id ? 'bg-[#2A2D32] text-white' : 'text-[#A6B0BF] hover:bg-[#1B1D21] hover:text-white'}`}><Icon className={`h-4 w-4 shrink-0 ${active === id ? 'text-[#F3F4F6]' : 'text-[#858B94]'}`} /><span>{label}</span></button>)}</div>
          </div>)}
        </nav>
      </aside>
    </>
  );
}

function CreatorDestinationPlaceholder({ item, onBack }: { item: CareerSidebarItem; onBack: () => void }) {
  const Icon = item.icon;
  return <section className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center text-white"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3A3F46] bg-[#17191D] text-[#D1D5DB]"><Icon className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-bold">{item.label}</h1><p className="mt-2 max-w-sm text-sm leading-6 text-[#8995A5]">This Creator Studio workspace is ready for your next idea.</p><button type="button" onClick={onBack} className="mt-6 rounded-lg border border-[#3A3F46] px-3 py-2 text-xs text-[#D1D5DB] transition hover:bg-[#1B1D21]">Back to chat</button></section>;
}

type UnifiedHubKey = keyof typeof UNIFIED_HUBS;

type PdfDocument = {
  id: string;
  name: string;
  pageCount: number;
  pageTexts: string[];
  file: File;
};

function inferRelevantPages(question: string, pageTexts: string[]) {
  const normalized = question.toLowerCase();
  if (!normalized.trim()) return [1];

  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return [1];

  return pageTexts
    .map((pageText, index) => {
      const lower = pageText.toLowerCase();
      const score = tokens.reduce((total, token) => total + (lower.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'))?.length ?? 0), 0);
      return { page: index + 1, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ page }) => page);
}

function buildGroundedPrompt(question: string, document: PdfDocument) {
  const text = document.pageTexts.map((pageText, index) => `Page ${index + 1}: ${pageText}`).join('\n\n');
  return [
    'You are answering from the uploaded PDF only. Use the document content as the source of truth.',
    `Question: ${question}`,
    'If the answer is not explicitly in the PDF, say that it is not present in the uploaded document.',
    'Base your response on the text below and keep it clear and practical.',
    text.slice(0, 18_000),
  ].join('\n\n');
}

function UnifiedHubWorkspace({ hub }: { hub: UnifiedHubKey }) {
  const [location, navigate] = useLocation();
  const config = UNIFIED_HUBS[hub];
  const [mode, setMode] = useState<string>(config.modes[0][0]);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [careerSidebarOpen, setCareerSidebarOpen] = useState(false);
  const [careerView, setCareerView] = useState('chat');
  const [businessSidebarOpen, setBusinessSidebarOpen] = useState(false);
  const [businessView, setBusinessView] = useState('chat');
  const [creatorSidebarOpen, setCreatorSidebarOpen] = useState(false);
  const [creatorView, setCreatorView] = useState('chat');
  const [attachmentName, setAttachmentName] = useState('');
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleTyping = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const isInsideMenu = !!target?.closest('[data-menu-panel="true"]');
      const isIgnoredKey = event instanceof KeyboardEvent && (
        event.key === 'Tab' ||
        event.key === 'Escape' ||
        event.key === 'Shift' ||
        event.key === 'CapsLock' ||
        event.key === 'Meta' ||
        event.key === 'Control' ||
        event.key === 'Alt' ||
        event.key === 'ContextMenu'
      );

      if (isInsideMenu || isIgnoredKey) return;
      setMenuOpen(false);
    };

    document.addEventListener('keydown', handleTyping, true);
    document.addEventListener('input', handleTyping, true);

    return () => {
      document.removeEventListener('keydown', handleTyping, true);
      document.removeEventListener('input', handleTyping, true);
    };
  }, [menuOpen]);
  const [pdfPreviewPage, setPdfPreviewPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAiHub = hub === 'ai';

  // Auto-scroll to latest message when messages change or loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  if (hub === 'business' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'insights') {
    return <BusinessInsights onBack={() => navigate('/hub/business')} />;
  }

  const handlePdfUpload = async (file: File | null) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
      return;
    }

    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href;

      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocument({ data: bytes }).promise;
      const pageTexts: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pageTexts.push(pageText || 'No extractable text found on this page.');
      }

      setPdfDocument({
        id: `${Date.now()}-${file.name}`,
        name: file.name.replace(/\.pdf$/i, ''),
        file,
        pageCount: pdf.numPages,
        pageTexts,
      });
      setPdfPreviewPage(1);
      setAttachmentName(file.name);
      setPrompt((current) => current || 'Summarize this PDF and highlight the most important points.');
      setMessages([]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read that PDF file.');
    }
  };

  const submit = async () => {
    const value = prompt.trim();
    if (!value || loading) return;
    setLoading(true);
    setError('');
    try {
      const targetHub: 'ai-assistant' | typeof hub = isAiHub ? 'ai-assistant' : hub;
      const promptText = isAiHub && pdfDocument ? buildGroundedPrompt(value, pdfDocument) : `${value}${attachmentName ? `\n\nAttached file: ${attachmentName}` : ''}`;
      const answer = await generateHubResponse(targetHub, { prompt: promptText, mode });
      setMessages((current) => [...current, { role: 'user', text: value }, { role: 'assistant', text: answer }]);
      setPrompt('');
      setAttachmentName('');
      if (isAiHub && pdfDocument) {
        const pageHints = inferRelevantPages(value, pdfDocument.pageTexts);
        setPdfPreviewPage(pageHints[0] ?? 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the AI service.');
    } finally {
      setLoading(false);
    }
  };

  const latestAnswer = messages.filter((message) => message.role === 'assistant').at(-1)?.text ?? '';
  const copyAnswer = async () => { if (latestAnswer) { await navigator.clipboard?.writeText(latestAnswer); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } };

  const handleAttach = () => fileInputRef.current?.click();

  const handleVoiceInput = () => {
    const SpeechRecognitionCtor = (window as typeof window & {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    }).SpeechRecognition ?? (window as typeof window & {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError('Voice input is not available in this browser. Use the text box instead.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript as string | undefined;
      if (transcript) {
        setPrompt((current) => `${current}${current ? ' ' : ''}${transcript}`.trim());
      }
    };
    recognition.onerror = () => setError('Voice input is unavailable right now. Please type your prompt instead.');
    recognition.start();
  };

  useEffect(() => {
    if (!isAiHub || !pdfDocument || !previewCanvasRef.current) return;

    let cancelled = false;

    const renderPdfPage = async () => {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href;
      const pdf = await getDocument({ data: new Uint8Array(await pdfDocument.file.arrayBuffer()) }).promise;
      const page = await pdf.getPage(pdfPreviewPage);
      const viewport = page.getViewport({ scale: 1.25 });
      const canvas = previewCanvasRef.current;
      if (!canvas || cancelled) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;
    };

    void renderPdfPage();
    return () => {
      cancelled = true;
    };
  }, [isAiHub, pdfDocument, pdfPreviewPage]);

  const navItems = isAiHub
    ? [
        { label: 'Chat with PDF', icon: FileText, active: true },
        { label: 'New Document', icon: FileText },
        { label: 'History', icon: Clock3 },
        { label: 'My Documents', icon: FolderOpen },
        { label: 'Upload PDF', icon: Upload },
      ]
    : [
        { label: 'Home', icon: FileText, active: true },
        { label: 'History', icon: Clock3 },
        { label: 'My Documents', icon: FolderOpen },
        { label: 'Saved', icon: Bookmark },
        { label: 'Settings', icon: Settings2 },
      ];

  const quickActions = ['Summarize', 'Extract Key Points', 'Explain', 'Find Information'];
  const careerSidebarItem = CAREER_SIDEBAR_GROUPS.flatMap((group) => group.items).find((item) => item.id === careerView) ?? CAREER_SIDEBAR_GROUPS[0].items[0];
  const businessSidebarItem = BUSINESS_SIDEBAR_GROUPS.flatMap((group) => group.items).find((item) => item.id === businessView) ?? BUSINESS_SIDEBAR_GROUPS[0].items[0];
  const creatorSidebarItem = CREATOR_SIDEBAR_GROUPS.flatMap((group) => group.items).find((item) => item.id === creatorView) ?? CREATOR_SIDEBAR_GROUPS[0].items[0];
  const selectBusinessItem = (id: string) => {
    if (id === 'dashboard') {
      navigate('/hub/business?view=insights');
      return;
    }
    setBusinessView(id);
    setMessages([]);
    setPrompt('');
    setError('');
  };

  const selectCreatorItem = (id: string) => {
    setCreatorView(id);
    setMessages([]);
    setPrompt('');
    setError('');
  };

  if (hub === 'business' && businessView !== 'chat') {
    return (
      <div className="business-hub-layout flex h-[100dvh] min-h-0 w-full bg-[#000000]">
        <BusinessSidebar open={businessSidebarOpen} active={businessView} onClose={() => setBusinessSidebarOpen(false)} onSelect={selectBusinessItem} />
        <ChatViewport className="business-chat-viewport bg-[#000000] text-white">
          <main className="min-w-0 flex-1 overflow-y-auto"><BusinessDestinationPlaceholder item={businessSidebarItem} onBack={() => setBusinessView('chat')} /></main>
        </ChatViewport>
      </div>
    );
  }

  if (hub === 'creator' && creatorView !== 'chat') {
    return (
      <div className="creator-studio-layout flex h-[100dvh] min-h-0 w-full bg-[#000000]">
        <CreatorSidebar open={creatorSidebarOpen} active={creatorView} onClose={() => setCreatorSidebarOpen(false)} onSelect={selectCreatorItem} />
        <ChatViewport className="creator-chat-viewport bg-[#000000] text-white">
          <main className="min-w-0 flex-1 overflow-y-auto"><CreatorDestinationPlaceholder item={creatorSidebarItem} onBack={() => setCreatorView('chat')} /></main>
        </ChatViewport>
      </div>
    );
  }

  if (hub === 'career' && careerView !== 'chat') {
    return (
      <ChatViewport className="bg-[#000000] text-white">
        <div className="flex min-h-0 h-full w-full bg-[#000000]">
          <CareerPathSidebar
            open={careerSidebarOpen}
            active={careerView}
            onClose={() => setCareerSidebarOpen(false)}
            onSelect={(id) => {
              setCareerView(id);
              setMessages([]);
              setPrompt('');
              setError('');
            }}
          />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <CareerDestinationPlaceholder item={careerSidebarItem} />
          </main>
        </div>
      </ChatViewport>
    );
  }

  return (
    <div className={hub === 'business' ? 'business-hub-layout flex h-[100dvh] min-h-0 w-full bg-[#000000]' : hub === 'creator' ? 'creator-studio-layout flex h-[100dvh] min-h-0 w-full bg-[#000000]' : ''}>
      {hub === 'business' && <BusinessSidebar open={businessSidebarOpen} active={businessView} onClose={() => setBusinessSidebarOpen(false)} onSelect={selectBusinessItem} />}
      {hub === 'creator' && <CreatorSidebar open={creatorSidebarOpen} active={creatorView} onClose={() => setCreatorSidebarOpen(false)} onSelect={selectCreatorItem} />}
      <ChatViewport className={hub === 'business' ? 'business-chat-viewport bg-[#000000] text-white' : hub === 'creator' ? 'creator-chat-viewport bg-[#000000] text-white' : 'bg-[#000000] text-white'}>
      <div className="flex min-h-0 flex-1 w-full flex-col bg-[#000000]">
        <header className="relative flex items-center justify-between border-b border-[#1A1A1A] bg-[#000000] px-4 pb-2.5 pt-1 md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => hub === 'career' ? setCareerSidebarOpen(true) : hub === 'business' ? setBusinessSidebarOpen(true) : hub === 'creator' ? setCreatorSidebarOpen(true) : setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#232323] bg-[#050505] text-[#dfe7ef]"
            >
              <div className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </div>
            </button>
            <div className="text-[15px] font-medium text-[#f5f7fa]">{config.title.replace(' Hub', '')}</div>
          </div>

          {menuOpen && (
            <div data-menu-panel="true" className="absolute left-4 top-[calc(100%+0.4rem)] z-20 w-[220px] rounded-2xl border border-[#1A1A1A] bg-[#050505] p-2 shadow-none">
              <button type="button" onClick={() => { setMenuOpen(false); navigate('/'); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>Home</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setMessages([]); setPrompt(''); setError(''); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>✦ New Document</span>
                <FileText className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setMessages([]); setPrompt(''); setError(''); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>◷ History</span>
                <Clock3 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setMessages([]); setPrompt(''); setError(''); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>📁 My Documents</span>
                <FolderOpen className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setMessages([]); setPrompt(''); setError(''); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>Upload PDF</span>
                <Upload className="h-4 w-4" />
              </button>

              {isAiHub && (
                <div className="mt-2 border-t border-[#1A1A1A] pt-2">
                  <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7786]">Tools</div>
                  {['Ask PDF', 'Summarize', 'Extract Information', 'Analyze'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { setMenuOpen(false); setError(''); setPrompt(label === 'Ask PDF' ? 'Ask about this PDF: ' : label === 'Summarize' ? 'Summarize this PDF: ' : label === 'Extract Information' ? 'Extract key information from this PDF: ' : 'Analyze this PDF: '); }}
                      className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]"
                    >
                      <span>{label}</span>
                      {label === 'Ask PDF' && <MessageCircleQuestion className="h-4 w-4" />}
                      {label === 'Summarize' && <FileText className="h-4 w-4" />}
                      {label === 'Extract Information' && <Search className="h-4 w-4" />}
                      {label === 'Analyze' && <BarChart3 className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}

              <button type="button" onClick={() => { setMenuOpen(false); void copyAnswer(); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>★ Saved</span>
                <Bookmark className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); openFeedbackForm(); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>Feedback</span>
                <MessageCircleQuestion className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setError('Settings are not available in this demo yet.'); }} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#ebf4ff] hover:bg-[#171717]">
                <span>⚙ Settings</span>
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {hub === 'career' && (
            <CareerPathSidebar
              open={careerSidebarOpen}
              active={careerView}
              onClose={() => setCareerSidebarOpen(false)}
              onSelect={(id) => {
                setCareerView(id);
                setMessages([]);
                setPrompt('');
                setError('');
              }}
            />
          )}
          {isAiHub && (
            <aside className="hidden w-[240px] shrink-0 border-r border-[#1A1A1A] bg-[#090909] px-3 py-4 md:flex md:flex-col">
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#1A1A1A] bg-[#101010] px-3 py-2.5">
                <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-[#91A0B0] transition hover:text-white" aria-label="Back to dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112c5d] text-[#dfeeff]">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">Chat with PDF</div>
                </div>
              </div>

              <nav className="space-y-1.5">
                {navItems.map(({ label, icon: Icon, active }) => (
                  <button
                    key={label}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active ? 'bg-[#171717] text-white' : 'text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="my-4 h-px bg-[#1A1A1A]" />

              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b7786]">Tools</div>
              <nav className="space-y-1.5">
                {['Ask PDF', 'Summarize', 'Extract Information', 'Analyze'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#b4c0ce] transition hover:bg-[#0f0f0f] hover:text-white"
                  >
                    {label === 'Ask PDF' && <MessageCircleQuestion className="h-4 w-4" />}
                    {label === 'Summarize' && <FileText className="h-4 w-4" />}
                    {label === 'Extract Information' && <Search className="h-4 w-4" />}
                    {label === 'Analyze' && <BarChart3 className="h-4 w-4" />}
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-1.5 pt-4">
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white">
                  <Bookmark className="h-4 w-4" />
                  <span>Saved</span>
                </button>
                <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white">
                  <Settings2 className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </aside>
          )}

          <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#000000]">
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#000000] px-3 pb-[calc(11.25rem+env(safe-area-inset-bottom))] pt-3 md:px-4 md:pb-6">
              {isAiHub && pdfDocument && (
                <div className="mb-4 rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#121212] text-[#8bb5ff]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{pdfDocument.name}.pdf</div>
                        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">{pdfDocument.pageCount} pages · Processed</div>
                      </div>
                      </div>
                    <button 
                      type="button" 
                      onClick={() => pdfInputRef.current?.click()} 
                      style={{ color: config.color }}
                      className="rounded-xl border border-[#1A1A1A] bg-[#121212] px-2.5 py-1.5 text-[11px] font-medium"
                    >
                      More
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setPrompt(`${action}: `)}
                        style={{
                          borderColor: config.color + '40',
                          color: config.color,
                        }}
                        className="shrink-0 rounded-full border bg-[#121212] px-3 py-1.5 text-[11px] transition hover:opacity-80"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex h-full min-h-[260px] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div 
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ 
                        backgroundColor: config.color + '20',
                        color: config.color
                      }}
                    >
                      <config.icon className="h-6 w-6" />
                    </div>
                    {isAiHub && (
                      <>
                        <h2 className="text-[22px] font-semibold tracking-tight text-white">Chat with your PDFs</h2>
                        <p className="mt-3 text-sm leading-6 text-[#8f9aad]">
                          Upload a PDF and ask questions, summarize content, extract information, or analyze the document.
                        </p>
                      </>
                    )}
                    {isAiHub && (
                      <div className="mt-5 flex justify-center">
                        <button 
                          type="button" 
                          onClick={() => pdfInputRef.current?.click()} 
                          style={{
                            borderColor: config.color + '60',
                            backgroundColor: config.color + '15',
                            color: config.color
                          }}
                          className="rounded-full border px-4 py-2 text-[12px] font-semibold transition hover:opacity-80"
                        >
                          + Upload PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-3">
                  {messages.map((message, index) => {
                    const citationPages = message.role === 'assistant' ? inferRelevantPages(message.text, pdfDocument?.pageTexts ?? []) : [];
                    return (
                      <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[22px] px-3.5 py-2.5 text-[14px] leading-6 ${message.role === 'user' ? 'bg-[#050505] text-[#eaf3ff]' : 'bg-[#090909] text-[#dfe6ef]'}`}>
                          {message.role === 'assistant' ? (
                            <div className="prose prose-invert max-w-none prose-p:my-1 prose-pre:rounded-xl prose-pre:border prose-pre:border-[#2b2b2b] prose-pre:bg-[#090909] prose-pre:p-2 prose-code:text-[11px]">
                              <ReactMarkdown>{message.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.text}</div>
                          )}

                          {message.role === 'assistant' && isAiHub && pdfDocument && citationPages.length > 0 && (
                            <div className="mt-3 border-t border-[#1A1A1A] pt-2 text-[11px] text-[#8ea1bc]">
                              <span className="font-medium text-[#b7c7dc]">Sources</span>
                              <span className="ml-2">·</span>
                              <button type="button" onClick={() => setPdfPreviewPage(citationPages[0] ?? 1)} className="ml-2 underline decoration-dotted underline-offset-2">Pages {citationPages[0]}{citationPages.length > 1 ? `–${citationPages[citationPages.length - 1]}` : ''}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div key="loading" className="flex justify-start">
                      <div className="max-w-[85%] rounded-[22px] bg-[#090909] px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="inline-block h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: config.color, animationDelay: '0ms' }}></span>
                            <span className="inline-block h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: config.color, animationDelay: '150ms' }}></span>
                            <span className="inline-block h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: config.color, animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-[12px]" style={{ color: config.color }}>Thinking…</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {error && (
              <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-[12px] text-red-200">
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => void submit()} className="font-semibold text-white underline">Retry</button>
              </div>
            )}

            <div className={`pointer-events-none fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#000000] via-[#000000]/95 to-transparent px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-4 md:px-4 ${hub === 'career' ? 'md:left-[236px]' : ''}`}>
              <div className="pointer-events-auto mx-auto max-w-5xl">
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {config.modes.map(([label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setMode(label)}
                      style={{
                        borderColor: mode === label ? config.color : '#232323',
                        backgroundColor: mode === label ? config.color + '20' : '#121212',
                        color: mode === label ? config.color : '#b0bcc9',
                      }}
                      className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition hover:opacity-80"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="rounded-[26px] border border-[#1a1a1a] bg-[#0b0f12] p-2 shadow-[0_-10px_24px_rgba(0,0,0,0.25)]">
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={isAiHub ? () => pdfInputRef.current?.click() : handleAttach}
                      aria-label={isAiHub ? 'Upload PDF' : 'Attach file'}
                      style={{
                        borderColor: config.color + '40',
                        backgroundColor: config.color + '15',
                        color: config.color,
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition hover:opacity-80"
                    >
                      {isAiHub ? <Upload className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>

                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !loading) {
                          event.preventDefault();
                          void submit();
                        }
                      }}
                      rows={1}
                      disabled={loading}
                      placeholder={isAiHub ? 'Ask anything about this PDF...' : `Ask ${config.title.replace(' Hub', '')}`}
                      className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-[14px] leading-5 text-[#edf4ff] placeholder:text-[#6c7784] outline-none disabled:opacity-60"
                    />

                    <button
                      type="button"
                      aria-label="Voice input"
                      onClick={handleVoiceInput}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#181818] text-[#e8edf5]"
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => { if (!loading) void submit(); }}
                      disabled={loading}
                      aria-label={loading ? 'Generating response' : 'Send message'}
                      style={{ 
                        backgroundColor: config.color,
                        boxShadow: `0_8px_18px_${config.color.replace('#', '')}59`
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#000000] shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex gap-0.5">
                          <span className="inline-block h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="inline-block h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="inline-block h-1 w-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {attachmentName && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-[#181818] px-2.5 py-1.5 text-[11px] text-[#c4d0df]">
                      <span className="truncate">{attachmentName}</span>
                      <button type="button" onClick={() => setAttachmentName('')} className="ml-2 text-[#8ca6d5]">Clear</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {isAiHub && (
            <aside className="hidden w-[320px] shrink-0 border-l border-[#1A1A1A] bg-[#090909] p-3 xl:flex xl:flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7786]">PDF Viewer</div>
                <button type="button" className="rounded-lg border border-[#1A1A1A] bg-[#121212] px-2 py-1 text-[10px] text-[#dfeaff]">Full</button>
              </div>

              <div className="rounded-[20px] border border-[#1A1A1A] bg-[#000000] p-3">
                <div className="flex items-center justify-center overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0d1117] p-2">
                  <canvas ref={previewCanvasRef} className="max-h-[260px] max-w-full rounded-lg bg-white" />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#cbd6e2]">
                  <span>Page {pdfPreviewPage}</span>
                  <span>{pdfDocument?.pageCount ?? 0} total</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button type="button" onClick={() => setPdfPreviewPage((page) => Math.max(1, page - 1))} className="flex-1 rounded-xl border border-[#1A1A1A] bg-[#121212] px-2 py-1.5 text-[11px] text-[#dfeaff]">Prev</button>
                  <button type="button" onClick={() => setPdfPreviewPage((page) => Math.min(pdfDocument?.pageCount ?? 1, page + 1))} className="flex-1 rounded-xl border border-[#1A1A1A] bg-[#121212] px-2 py-1.5 text-[11px] text-[#dfeaff]">Next</button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#dfeaff]">
                  <button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#121212] px-2 py-1.5">Zoom -</button>
                  <button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#121212] px-2 py-1.5">Zoom +</button>
                  <button type="button" className="rounded-xl border border-[#1A1A1A] bg-[#121212] px-2 py-1.5 col-span-2">Search in PDF</button>
                </div>
              </div>

              <div className="mt-3 rounded-[20px] border border-[#1A1A1A] bg-[#0b1016] p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7786]">Page thumbnails</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: Math.min(pdfDocument?.pageCount ?? 4, 4) }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPdfPreviewPage(index + 1)}
                      className={`rounded-xl border p-2 text-left ${pdfPreviewPage === index + 1 ? 'border-[#2f6df6] bg-[#112c5d]' : 'border-[#1A1A1A] bg-[#121212]'}`}
                    >
                      <div className="mb-1 text-[10px] text-[#b7c7dc]">Page {index + 1}</div>
                      <div className="h-12 rounded-lg bg-[#000000] border border-[#1A1A1A]" />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {!isAiHub && (
        <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setAttachmentName(file.name);
          setPrompt((current) => `${current}${current ? '\n' : ''}Attachment: ${file.name}`);
          event.target.value = '';
        }} />
      )}

      {isAiHub && (
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handlePdfUpload(file);
            }
            event.target.value = '';
          }}
        />
      )}
      </ChatViewport>
    </div>
  );
}

export default function HubWorkspace() {
  const [match, params] = useRoute('/hub/:hub');
  const hub = params?.hub as UnifiedHubKey | undefined;

  if (!match || !hub || !(hub in UNIFIED_HUBS)) {
    return (
      <div className="min-h-[calc(100vh-76px)] bg-[#070B11] px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#1B2936] bg-[#000000] p-8 text-center">
          <h1 className="text-xl font-bold">Workspace not found</h1>
          <p className="mt-3 text-sm text-[#9BA9B8]">This hub path is invalid or no longer available.</p>
        </div>
      </div>
    );
  }

  return <UnifiedHubWorkspace hub={hub} />;
}

