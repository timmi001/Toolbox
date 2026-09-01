import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useRoute, Link } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpen,
  Bookmark,
  Check,
  Clock3,
  FileText,
  FolderOpen,
  History,
  MessageCircleQuestion,
  Mic,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { generateHubResponse } from '@/lib/hub-ai';
import {
  addChatPdfDocument,
  addChatPdfSavedItem,
  createPdfConversationId,
  deleteChatPdfConversation,
  getActiveChatPdfConversationId,
  getActiveChatPdfDocument,
  getActiveChatPdfDocumentId,
  loadChatPdfDocuments,
  loadChatPdfHistory,
  loadChatPdfSavedItems,
  removeChatPdfDocument,
  removeChatPdfSavedItem,
  saveChatPdfSavedItems,
  setActiveChatPdfConversationId,
  setActiveChatPdfDocumentId,
  type ChatPdfConversation,
  type ChatPdfDocument,
  type ChatPdfSavedItem,
  upsertChatPdfConversation,
} from '@/utils/chatPdfStorage';
import { openFeedbackForm } from '@/components/FeedbackButton';

const sideNav: Array<{ label: string; icon: LucideIcon; route: string; action?: 'upload' | 'new-document' | 'settings' | 'feedback' }> = [
  { label: 'Chat with PDF', icon: FileText, route: '/chat-with-pdf' },
  { label: 'New Document', icon: Plus, route: '/chat-with-pdf', action: 'new-document' },
  { label: 'History', icon: Clock3, route: '/chat-with-pdf/history' },
  { label: 'My Documents', icon: FolderOpen, route: '/chat-with-pdf/documents' },
  { label: 'Upload PDF', icon: Upload, route: '/chat-with-pdf', action: 'upload' },
  { label: 'Saved', icon: Bookmark, route: '/chat-with-pdf/saved' },
  { label: 'Tools', icon: Sparkles, route: '/chat-with-pdf/tools' },
  { label: 'Settings', icon: Settings2, route: '/chat-with-pdf', action: 'settings' },
];

function buildGroundedPrompt(question: string, document: ChatPdfDocument) {
  const text = document.pageTexts.map((pageText, index) => `Page ${index + 1}: ${pageText}`).join('\n\n');
  return [
    'You are answering from the uploaded PDF only. Use the document content as the source of truth.',
    `Question: ${question}`,
    'If the answer is not explicitly in the PDF, say it is not present in the uploaded document.',
    'Cite page numbers when possible and keep the answer clear and practical.',
    text.slice(0, 18_000),
  ].join('\n\n');
}

function inferRelevantPages(question: string, pageTexts: string[]) {
  const normalized = question.toLowerCase();
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (!pageTexts.length || !tokens.length) return [1];

  return pageTexts
    .map((pageText, index) => {
      const lower = pageText.toLowerCase();
      const score = tokens.reduce((total, token) => {
        const pattern = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return total + (lower.match(pattern)?.length ?? 0);
      }, 0);
      return { page: index + 1, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ page }) => page);
}

function getConversationTitle(documentName?: string | null, fallback = 'Untitled PDF chat') {
  return documentName ? `${documentName} discussion` : fallback;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

async function extractPdfText(file: File): Promise<ChatPdfDocument> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data: bytes }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pageTexts.push(text || 'No extractable text found on this page.');
  }

  return {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.pdf$/i, ''),
    fileName: file.name,
    pageCount: pdf.numPages,
    pageTexts,
    uploadDate: new Date().toISOString(),
    status: 'ready',
    size: file.size,
  };
}

function ChatPdfShell({
  title,
  subtitle,
  children,
  onUpload,
  activeDocumentName,
  navActive,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onUpload: () => void;
  activeDocumentName?: string | null;
  navActive?: string;
}) {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="hidden w-[260px] shrink-0 border-r border-[#1A1A1A] bg-[#090909] p-3 md:flex md:flex-col">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#1A1A1A] bg-[#101010] px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E2D3B] text-[#A5D8FF]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#6b7786]">Workspace</div>
              <div className="truncate text-sm font-semibold text-white">Chat with PDF</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {sideNav.map(({ label, icon: Icon, route, action }) => {
              const isActive = navActive === label || (!navActive && label === 'Chat with PDF');
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (action === 'upload') {
                      onUpload();
                      return;
                    }
                    if (action === 'new-document') {
                      const nextDocId = getActiveChatPdfDocumentId();
                      if (nextDocId) setActiveChatPdfDocumentId(null);
                      setActiveChatPdfConversationId(null);
                      navigate('/chat-with-pdf');
                      window.dispatchEvent(new CustomEvent('chat-pdf-reset')); 
                      return;
                    }
                    if (action === 'settings') {
                      navigate('/chat-with-pdf');
                      return;
                    }
                    if (action === 'feedback') {
                      openFeedbackForm();
                      return;
                    }
                    navigate(route);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${isActive ? 'bg-[#171717] text-white' : 'text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1.5 pt-4">
            <button type="button" onClick={() => navigate('/chat-with-pdf/saved')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white">
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </button>
            <button type="button" onClick={openFeedbackForm} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white">
              <MessageCircleQuestion className="h-4 w-4" />
              <span>Feedback</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#1A1A1A] bg-[#000000] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#232323] bg-[#050505] text-[#dfe7ef] md:hidden"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                  <span className="block h-0.5 w-4 rounded-full bg-current" />
                </div>
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#6b7786]">PDF workspace</div>
                <div className="text-base font-semibold text-white">{title}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeDocumentName ? (
                <div className="hidden items-center gap-2 rounded-full border border-[#1A1A1A] bg-[#0E151D] px-2.5 py-1 text-[11px] text-[#cfe5ff] md:flex">
                  <FileText className="h-3.5 w-3.5 text-[#7FC7FF]" />
                  <span className="truncate max-w-[180px]">{activeDocumentName}</span>
                </div>
              ) : null}
              <button type="button" onClick={openFeedbackForm} className="rounded-full border border-[#2d3f3a] bg-[#111c18] px-2.5 py-1.5 text-[11px] font-semibold text-[#bff8d6]">Feedback</button>
            </div>
          </header>

          {menuOpen && (
            <div className="border-b border-[#1A1A1A] bg-[#060606] p-3 md:hidden">
              <div className="space-y-1.5">
                {sideNav.map(({ label, icon: Icon, route, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (action === 'upload') { onUpload(); return; }
                      if (action === 'new-document') {
                        setActiveChatPdfConversationId(null);
                        setActiveChatPdfDocumentId(null);
                        navigate('/chat-with-pdf');
                        window.dispatchEvent(new CustomEvent('chat-pdf-reset'));
                        return;
                      }
                      if (action === 'settings') {
                        navigate('/chat-with-pdf');
                        return;
                      }
                      navigate(route);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#eaf2ff] hover:bg-[#171717]"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-[#000000] px-3 pb-6 pt-4 md:px-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

function ChatPdfWorkspacePage() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDocument, setActiveDocument] = useState<ChatPdfDocument | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const applyStoredState = () => {
      const storedDocument = getActiveChatPdfDocument();
      const storedConversationId = getActiveChatPdfConversationId();
      setActiveDocument(storedDocument);
      setConversationId(storedConversationId);

      if (storedConversationId) {
        const history = loadChatPdfHistory();
        const currentConversation = history.find((item) => item.id === storedConversationId);
        setMessages(currentConversation?.messages ?? []);
      } else {
        setMessages([]);
      }
    };

    applyStoredState();

    const handleReset = () => {
      setActiveDocument(null);
      setConversationId(null);
      setMessages([]);
      setMessage('');
      setError('');
    };

    window.addEventListener('chat-pdf-reset', handleReset);
    return () => window.removeEventListener('chat-pdf-reset', handleReset);
  }, []);

  const persistConversation = (nextMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>, customDocument?: ChatPdfDocument | null) => {
    const finalDocument = customDocument ?? activeDocument;
    const nextId = conversationId ?? createPdfConversationId();
    setConversationId(nextId);
    setActiveChatPdfConversationId(nextId);

    const docName = finalDocument?.name ?? activeDocument?.name ?? null;
    const nextConversation: ChatPdfConversation = {
      id: nextId,
      title: generatedTitle || getConversationTitle(docName),
      documentId: finalDocument?.id ?? activeDocument?.id ?? null,
      documentName: docName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };
    upsertChatPdfConversation(nextConversation);
  };

  const handleUpload = async (file?: File | null) => {
    const target = file ?? inputRef.current?.files?.[0];
    if (!target) return;
    if (target.type !== 'application/pdf' && !target.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const document = await extractPdfText(target);
      addChatPdfDocument(document);
      setActiveDocument(document);
      setActiveChatPdfDocumentId(document.id);
      setGeneratedTitle(document.name);
      setMessages([]);
      setConversationId(null);
      setActiveChatPdfConversationId(null);
      navigate('/chat-with-pdf');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The PDF could not be processed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const sendPrompt = async (customPrompt?: string) => {
    const value = (customPrompt ?? message).trim();
    if (!value) return;
    if (!activeDocument) {
      setError('Please upload or select a PDF before asking a question.');
      return;
    }

    setLoading(true);
    setError('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: value, createdAt: new Date().toISOString() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage('');

    try {
      const grounded = buildGroundedPrompt(value, activeDocument);
      const reply = await generateHubResponse('ai-assistant', { prompt: grounded, mode: 'Chat with PDF' });
      const assistantMessage: { id: string; role: 'assistant'; content: string; createdAt: string } = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      const finalMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }> = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      persistConversation(finalMessages, activeDocument);
      const pages = inferRelevantPages(value, activeDocument.pageTexts);
      if (pages[0]) {
        setGeneratedTitle(`${activeDocument.name} — page ${pages[0]}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI service could not answer this request.');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentResponse = (itemType: 'summary' | 'extract' | 'analysis' | 'result', title: string, content: string) => {
    if (!content.trim()) return;
    const result: ChatPdfSavedItem = {
      id: crypto.randomUUID(),
      type: itemType,
      title,
      content,
      documentId: activeDocument?.id ?? null,
      documentName: activeDocument?.name ?? null,
      createdAt: new Date().toISOString(),
    };
    addChatPdfSavedItem(result);
  };

  const runContextAction = async (type: 'summary' | 'extract' | 'analysis', customPrompt?: string) => {
    if (!activeDocument) {
      setError('Select or upload a PDF before running this action.');
      return;
    }
    const promptText = customPrompt ?? {
      summary: `Summarize this PDF in plain language and include the most important findings with page references when available.`,
      extract: `Extract the names, dates, numbers, and key facts from this PDF in a structured format.`,
      analysis: `Analyze the main arguments, findings, risks, and conclusions in this PDF.`,
    }[type];

    setLoading(true);
    setError('');
    try {
      const grounded = buildGroundedPrompt(promptText, activeDocument);
      const reply = await generateHubResponse('ai-assistant', { prompt: grounded, mode: type === 'summary' ? 'Summarize' : type === 'extract' ? 'Extract Information' : 'Analyze' });
      const userActionMessage: { id: string; role: 'user'; content: string; createdAt: string } = {
        id: crypto.randomUUID(),
        role: 'user',
        content: promptText,
        createdAt: new Date().toISOString(),
      };
      const assistantMessage: { id: string; role: 'assistant'; content: string; createdAt: string } = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      const finalMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }> = [...messages, userActionMessage, assistantMessage];
      setMessages(finalMessages);
      persistConversation(finalMessages, activeDocument);
      saveCurrentResponse(type, `${type.charAt(0).toUpperCase()}${type.slice(1)}: ${activeDocument.name}`, reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The workspace could not generate the requested result.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ChatPdfShell
        title="Chat with PDF"
        subtitle="Upload and chat with your document."
        navActive="Chat with PDF"
        activeDocumentName={activeDocument?.name ?? null}
        onUpload={() => inputRef.current?.click()}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#111111] text-[#7FC7FF]">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{activeDocument ? activeDocument.name : 'No document selected'}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">
                    {activeDocument ? `${activeDocument.pageCount} pages • Ready` : 'Upload a PDF to start'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => runContextAction('summary')} className="rounded-full border border-[#1A1A1A] bg-[#121212] px-3 py-1.5 text-[11px] text-[#dfeaff]">Summarize</button>
                <button type="button" onClick={() => runContextAction('extract')} className="rounded-full border border-[#1A1A1A] bg-[#121212] px-3 py-1.5 text-[11px] text-[#dfeaff]">Extract Information</button>
                <button type="button" onClick={() => runContextAction('analysis')} className="rounded-full border border-[#1A1A1A] bg-[#121212] px-3 py-1.5 text-[11px] text-[#dfeaff]">Analyze</button>
              </div>
            </div>
          </div>

          {activeDocument ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="rounded-[26px] border border-[#1A1A1A] bg-[#0a0f15] p-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1A1A1A] bg-[#101821] text-[#7FC7FF]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Ask a question about this PDF</h2>
                    <p className="mt-2 text-sm leading-6 text-[#8fa2b8]">Summaries, key facts, and grounded answers will appear here as soon as you ask.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((item) => (
                      <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] rounded-[20px] px-3.5 py-2.5 text-[14px] leading-6 ${item.role === 'user' ? 'bg-[#0b1320] text-[#ebf5ff]' : 'bg-[#101010] text-[#dfeaf8]'}`}>
                          {item.role === 'assistant' ? (
                            <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:rounded-xl prose-pre:border prose-pre:border-[#262626] prose-pre:bg-[#050505] prose-pre:p-3">
                              <ReactMarkdown>{item.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{item.content}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <aside className="rounded-[24px] border border-[#1A1A1A] bg-[#090909] p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7786]">Document info</div>
                <div className="space-y-3 text-sm text-[#d8e3f3]">
                  <div className="rounded-xl border border-[#1A1A1A] bg-[#0d1117] p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">Name</div>
                    <div className="mt-1 font-medium text-white">{activeDocument.name}</div>
                  </div>
                  <div className="rounded-xl border border-[#1A1A1A] bg-[#0d1117] p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">Pages</div>
                    <div className="mt-1 font-medium text-white">{activeDocument.pageCount}</div>
                  </div>
                  <div className="rounded-xl border border-[#1A1A1A] bg-[#0d1117] p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">Uploaded</div>
                    <div className="mt-1 font-medium text-white">{formatDate(activeDocument.uploadDate)}</div>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="flex min-h-[380px] items-center justify-center rounded-[26px] border border-dashed border-[#1A1A1A] bg-[#090909] p-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1A1A1A] bg-[#0d151d] text-[#7FC7FF]">
                  <Upload className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">No PDF active</h2>
                <p className="mt-2 text-sm leading-6 text-[#8fa2b8]">Choose a PDF to start a grounded chat, then use the sidebar to summarize, extract information, and analyze the document.</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-full border border-[#2d3f3a] bg-[#111c18] px-4 py-2 text-[12px] font-semibold text-[#bff8d6]">Upload PDF</button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-[12px] text-red-200">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="font-semibold text-white underline">Dismiss</button>
            </div>
          )}

          {uploading && (
            <div className="mt-4 rounded-2xl border border-[#1A1A1A] bg-[#101010] px-3 py-2 text-sm text-[#cfe5ff]">Processing PDF…</div>
          )}

          <div className="mt-5 rounded-[26px] border border-[#1a1a1a] bg-[#000000] p-2">
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#171717] text-[#e8edf5]" aria-label="Upload PDF">
                <Upload className="h-4 w-4" />
              </button>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendPrompt();
                  }
                }}
                rows={1}
                placeholder={activeDocument ? 'Ask anything about this PDF…' : 'Upload a PDF to begin…'}
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-[14px] leading-5 text-[#edf4ff] placeholder:text-[#6c7784] outline-none"
              />

              <button type="button" onClick={() => { const next = message.trim(); if (next) void sendPrompt(next); }} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f6df6] text-[#ffffff]">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </ChatPdfShell>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => { const file = event.target.files?.[0]; void handleUpload(file); event.target.value = ''; }}
      />
    </>
  );
}

function ChatPdfHistoryPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const history = useMemo(() => loadChatPdfHistory(), []);
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return history;
    return history.filter((item) => `${item.title} ${item.documentName ?? ''}`.toLowerCase().includes(trimmed));
  }, [history, query]);

  const openConversation = (conversation: ChatPdfConversation) => {
    const doc = loadChatPdfDocuments().find((item) => item.id === conversation.documentId) ?? getActiveChatPdfDocument();
    if (doc) {
      setActiveChatPdfDocumentId(doc.id);
    }
    setActiveChatPdfConversationId(conversation.id);
    navigate('/chat-with-pdf');
  };

  return (
    <ChatPdfShell title="History" subtitle="Your recent PDF conversations" navActive="History" activeDocumentName={getActiveChatPdfDocument()?.name ?? null} onUpload={() => navigate('/chat-with-pdf')}>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-[22px] border border-[#1A1A1A] bg-[#0d1117] p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#dfeaf8]">
              <History className="h-4 w-4 text-[#7FC7FF]" />
              <span>{filtered.length} conversations</span>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718194]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversation history" className="w-full rounded-xl border border-[#1A1A1A] bg-[#050505] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#718194]" />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[#1A1A1A] bg-[#090909] p-8 text-center text-[#8fa2b8]">No saved PDF conversations yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((conversation) => (
              <div key={conversation.id} className="rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-white">{conversation.title}</div>
                    <div className="mt-1 text-xs text-[#9aa9ba]">{conversation.documentName ?? 'Untitled PDF'} • {formatDate(conversation.updatedAt)}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#dfeaf8]">
                      <span className="rounded-full border border-[#1A1A1A] bg-[#101010] px-2 py-1">{conversation.messages.length} messages</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openConversation(conversation)} className="rounded-xl border border-[#1A1A1A] bg-[#111111] px-3 py-2 text-xs font-medium text-[#dfeaff]">Open</button>
                    <button type="button" onClick={() => {
                      deleteChatPdfConversation(conversation.id);
                      window.location.reload();
                    }} className="rounded-xl border border-red-900/80 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChatPdfShell>
  );
}

function ChatPdfDocumentsPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<ChatPdfDocument[]>(() => loadChatPdfDocuments());

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return documents;
    return documents.filter((document) => document.name.toLowerCase().includes(trimmed) || document.fileName.toLowerCase().includes(trimmed));
  }, [documents, query]);

  const openDocument = (document: ChatPdfDocument) => {
    setActiveChatPdfDocumentId(document.id);
    navigate('/chat-with-pdf');
  };

  const renameDocument = (documentId: string) => {
    const nextName = window.prompt('Rename document', documents.find((item) => item.id === documentId)?.name ?? '');
    if (!nextName || !nextName.trim()) return;
    const nextDocuments = documents.map((item) => (item.id === documentId ? { ...item, name: nextName.trim() } : item));
    setDocuments(nextDocuments);
    const existing = nextDocuments.find((item) => item.id === documentId);
    if (existing) {
      const all = loadChatPdfDocuments();
      const updated = all.map((item) => (item.id === documentId ? existing : item));
      localStorage.setItem('toolboxx-chat-pdf-documents', JSON.stringify(updated));
    }
  };

  const deleteDocument = (documentId: string) => {
    removeChatPdfDocument(documentId);
    setDocuments(loadChatPdfDocuments());
  };

  return (
    <ChatPdfShell title="My Documents" subtitle="Uploaded PDFs and their status" navActive="My Documents" activeDocumentName={getActiveChatPdfDocument()?.name ?? null} onUpload={() => navigate('/chat-with-pdf')}>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-[22px] border border-[#1A1A1A] bg-[#0d1117] p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#dfeaf8]">
              <FolderOpen className="h-4 w-4 text-[#7FC7FF]" />
              <span>{filtered.length} documents</span>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718194]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" className="w-full rounded-xl border border-[#1A1A1A] bg-[#050505] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#718194]" />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[#1A1A1A] bg-[#090909] p-8 text-center text-[#8fa2b8]">No PDFs uploaded yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((document) => (
              <div key={document.id} className="rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#101010] text-[#7FC7FF]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">{document.name}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[#9aa9ba]">
                        <span>{document.pageCount} pages</span>
                        <span>•</span>
                        <span>{formatDate(document.uploadDate)}</span>
                        <span>•</span>
                        <span>{document.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openDocument(document)} className="rounded-xl border border-[#1A1A1A] bg-[#111111] px-3 py-2 text-xs font-medium text-[#dfeaff]">Open</button>
                    <button type="button" onClick={() => renameDocument(document.id)} className="rounded-xl border border-[#1A1A1A] bg-[#111111] px-3 py-2 text-xs font-medium text-[#dfeaff]">Rename</button>
                    <button type="button" onClick={() => deleteDocument(document.id)} className="rounded-xl border border-red-900/80 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChatPdfShell>
  );
}

function ChatPdfToolsPage() {
  const [, navigate] = useLocation();
  const activeDocument = getActiveChatPdfDocument();
  const [selectedTool, setSelectedTool] = useState<string>('Summarize');

  const categories = [
    { title: 'Understand', items: ['Summarize', 'Explain Simply', 'Key Takeaways'] },
    { title: 'Extract', items: ['Extract Information', 'Extract Tables', 'Extract References'] },
    { title: 'Study', items: ['Generate Quiz', 'Generate Flashcards', 'Create Study Notes'] },
    { title: 'Research', items: ['Find Information', 'Compare Sections', 'Compare PDFs', 'Find Contradictions'] },
    { title: 'Transform', items: ['Translate', 'Rewrite', 'Simplify'] },
  ];

  const runTool = async (toolName: string) => {
    if (!activeDocument) {
      alert('Select or upload a PDF before using a tool.');
      return;
    }

    const promptText = {
      Summarize: 'Summarize the PDF and highlight key conclusions.',
      'Explain Simply': 'Explain the PDF in clear, simple language for a general audience.',
      'Key Takeaways': 'Identify the most important takeaways and actionable insights from the PDF.',
      'Extract Information': 'Extract names, dates, numbers, and key facts from the PDF.',
      'Extract Tables': 'Extract key tables, structured data points, and values from this PDF.',
      'Extract References': 'List the references, citations, and source names from the PDF.',
      'Generate Quiz': 'Generate a short quiz based on the PDF with answers included.',
      'Generate Flashcards': 'Create study flashcards from the main concepts in the PDF.',
      'Create Study Notes': 'Turn the PDF into study notes with summaries and key ideas.',
      'Find Information': 'Find the most relevant information in the PDF for this topic.',
      'Compare Sections': 'Compare the major sections of the PDF and explain their differences.',
      'Compare PDFs': 'Compare this PDF against the document context in the workspace.',
      'Find Contradictions': 'Look for contradictions, inconsistencies, or gaps in the PDF.',
      Translate: 'Translate the PDF content into a clear, neutral English version.',
      Rewrite: 'Rewrite the PDF content in a more concise and polished format.',
      Simplify: 'Simplify the PDF content and make the concepts easier to understand.',
    }[toolName] ?? `Use ${toolName} on the active PDF document.`;

    try {
      const reply = await generateHubResponse('ai-assistant', { prompt: buildGroundedPrompt(promptText, activeDocument), mode: toolName });
      const item: ChatPdfSavedItem = {
        id: crypto.randomUUID(),
        type: 'result',
        title: toolName,
        content: reply,
        documentId: activeDocument.id,
        documentName: activeDocument.name,
        createdAt: new Date().toISOString(),
      };
      addChatPdfSavedItem(item);
      navigate('/chat-with-pdf');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'This tool could not run for the selected PDF.');
    }
  };

  return (
    <ChatPdfShell title="Tools" subtitle="Advanced PDF analysis actions" navActive="Tools" activeDocumentName={activeDocument?.name ?? null} onUpload={() => navigate('/chat-with-pdf')}>
      <div className="mx-auto max-w-6xl">
        {!activeDocument ? (
          <div className="rounded-[26px] border border-dashed border-[#1A1A1A] bg-[#090909] p-8 text-center text-[#8fa2b8]">
            Select or upload a PDF before using advanced tools.
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map((category) => (
              <section key={category.title} className="rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-4">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7786]">{category.title}</div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => { setSelectedTool(item); void runTool(item); }}
                      className="rounded-2xl border border-[#1A1A1A] bg-[#101010] p-3 text-left transition hover:border-[#2f6df6]/70 hover:bg-[#111d2a]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{item}</span>
                        <ArrowRight className="h-4 w-4 text-[#9bb3d8]" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </ChatPdfShell>
  );
}

function ChatPdfSavedPage() {
  const [, navigate] = useLocation();
  const items = useMemo(() => loadChatPdfSavedItems(), []);

  return (
    <ChatPdfShell title="Saved" subtitle="Saved summaries, notes, and extracted insights" navActive="Saved" activeDocumentName={getActiveChatPdfDocument()?.name ?? null} onUpload={() => navigate('/chat-with-pdf')}>
      <div className="mx-auto max-w-6xl space-y-4">
        {items.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[#1A1A1A] bg-[#090909] p-8 text-center text-[#8fa2b8]">No saved PDF insights yet.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-[#9aa9ba]">{item.documentName ?? 'Untitled'} • {formatDate(item.createdAt)}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#dfeaf8]">{item.content.slice(0, 220)}{item.content.length > 220 ? '…' : ''}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => navigate('/chat-with-pdf')} className="rounded-xl border border-[#1A1A1A] bg-[#111111] px-3 py-2 text-xs font-medium text-[#dfeaff]">Open</button>
                  <button type="button" onClick={() => removeChatPdfSavedItem(item.id)} className="rounded-xl border border-red-900/80 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200">Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ChatPdfShell>
  );
}

export default function ChatWithPdfRoutes() {
  const [workspaceMatch] = useRoute('/chat-with-pdf');
  const [historyMatch] = useRoute('/chat-with-pdf/history');
  const [documentsMatch] = useRoute('/chat-with-pdf/documents');
  const [toolsMatch] = useRoute('/chat-with-pdf/tools');
  const [savedMatch] = useRoute('/chat-with-pdf/saved');

  if (historyMatch) return <ChatPdfHistoryPage />;
  if (documentsMatch) return <ChatPdfDocumentsPage />;
  if (toolsMatch) return <ChatPdfToolsPage />;
  if (savedMatch) return <ChatPdfSavedPage />;
  if (workspaceMatch) return <ChatPdfWorkspacePage />;

  return null;
}
