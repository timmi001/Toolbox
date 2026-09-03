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
  Copy,
  FileText,
  FolderOpen,
  History,
  MessageCircleQuestion,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Pencil,
  Search,
  Share2,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { generateHubResponse } from '@/lib/hub-ai';
import { pdf } from '@/lib/api';
import {
  addChatPdfDocument,
  addChatPdfSavedItem,
  createPdfConversationId,
  deleteChatPdfConversation,
  getActiveChatPdfConversationId,
  getActiveChatPdfDocumentIds,
  getActiveChatPdfDocument,
  getActiveChatPdfDocumentId,
  getViewedChatPdfDocumentId,
  loadChatPdfDocuments,
  loadChatPdfHistory,
  loadChatPdfSavedItems,
  removeChatPdfDocument,
  removeChatPdfSavedItem,
  saveChatPdfSavedItems,
  setActiveChatPdfConversationId,
  setActiveChatPdfDocumentIds,
  setActiveChatPdfDocumentId,
  setViewedChatPdfDocumentId,
  type ChatPdfConversation,
  type ChatPdfDocument,
  type ChatPdfSavedItem,
  upsertChatPdfConversation,
} from '@/utils/chatPdfStorage';
import { openFeedbackForm } from '@/components/FeedbackButton';
import { PdfToolsMenu } from '@/components/PdfToolsMenu';
import { ChatViewport } from '@/components/ChatViewport';

const MAX_CHAT_PDF_FILES = Number(import.meta.env.VITE_CHAT_PDF_MAX_FILES ?? 12);
const MAX_CHAT_PDF_FILE_SIZE = Number(import.meta.env.VITE_CHAT_PDF_MAX_FILE_SIZE ?? 25 * 1024 * 1024);
const MAX_CHAT_PDF_TOTAL_SIZE = Number(import.meta.env.VITE_CHAT_PDF_MAX_TOTAL_SIZE ?? 100 * 1024 * 1024);
const CHAT_PDF_QUICK_ACTIONS = ['Summarize', 'Extract Key Points', 'Explain', 'Find Information'];

const sideNav: Array<{ label: string; icon: LucideIcon; route: string; action?: 'history' | 'upload' | 'new-document' | 'settings' | 'feedback' }> = [
  { label: 'Chat with PDF', icon: FileText, route: '/chat-with-pdf' },
  { label: 'New Document', icon: Plus, route: '/chat-with-pdf', action: 'new-document' },
  { label: 'History', icon: Clock3, route: '/chat-with-pdf', action: 'history' },
  { label: 'My Documents', icon: FolderOpen, route: '/chat-with-pdf/documents' },
  { label: 'Upload PDF', icon: Upload, route: '/chat-with-pdf', action: 'upload' },
  { label: 'Tools', icon: Sparkles, route: '/chat-with-pdf/tools' },
  { label: 'Settings', icon: Settings2, route: '/chat-with-pdf', action: 'settings' },
];

function buildGroundedPrompt(question: string, documents: ChatPdfDocument[]) {
  const text = documents.map((document) => `Document: ${document.fileName}\n${document.pageTexts.map((pageText, index) => `Page ${index + 1}: ${pageText}`).join('\n\n')}`).join('\n\n');
  return [
    'You are answering from the selected uploaded PDFs only. Use the document content as the source of truth. Cite the PDF filename and page number for each source.',
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

function ChatPdfNavigation({
  collapsed,
  mobile = false,
  onUpload,
  onReset,
  onHistory,
  onNavigate,
  activeLabel,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  onUpload: () => void;
  onReset: () => void;
  onHistory?: () => void;
  onNavigate: (route: string) => void;
  activeLabel?: string;
}) {
  const navigate = (route: string, action?: string) => {
    if (action === 'upload') {
      onUpload();
      return;
    }
    if (action === 'new-document') {
      onReset();
      return;
    }
    if (action === 'history') {
      onHistory?.();
      return;
    }
    onNavigate(route);
  };

  return (
    <nav className={mobile ? 'space-y-1.5' : 'space-y-1.5'}>
      {sideNav.map(({ label, icon: Icon, route, action }) => (
        <button
          key={label}
          type="button"
          onClick={() => navigate(route, action)}
          title={!mobile && collapsed ? label : undefined}
          aria-label={label}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${!mobile && collapsed ? 'justify-center px-0' : ''} ${label === activeLabel ? 'bg-[#3A172F] text-white' : mobile ? 'text-[#eaf2ff] hover:bg-[#171717]' : 'text-[#b4c0ce] hover:bg-[#0f0f0f] hover:text-white'}`}
        >
          <Icon className="h-4 w-4" />
          {(!collapsed || mobile) && <span>{label}</span>}
        </button>
      ))}
    </nav>
  );
}

async function extractPdfText(file: File): Promise<ChatPdfDocument> {
  const response = await pdf.extract(file);
  return response.document;
}

function ChatPdfShell({
  title,
  subtitle,
  children,
  onUpload,
  onHistory,
  activeDocumentName,
  navActive,
  sidebarCollapsed: controlledSidebarCollapsed,
  onSidebarCollapsedChange,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onUpload: () => void;
  onHistory?: () => void;
  activeDocumentName?: string | null;
  navActive?: string;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  const sidebarCollapsed = controlledSidebarCollapsed ?? internalSidebarCollapsed;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ChatViewport className="bg-[#000000] text-white">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className={`hidden shrink-0 border-r border-[#1A1A1A] bg-[#090909] p-3 transition-[width] duration-200 md:flex md:flex-col ${sidebarCollapsed ? 'w-[76px]' : 'w-[240px]'}`}>
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => {
              const nextCollapsed = !sidebarCollapsed;
              onSidebarCollapsedChange?.(nextCollapsed);
              if (controlledSidebarCollapsed === undefined) setInternalSidebarCollapsed(nextCollapsed);
            }}
            className={`mb-3 flex h-9 w-full items-center justify-center rounded-xl border border-[#71345A] bg-[#1D101A] text-[#FFB5D9] transition hover:border-[#FF66B8] hover:bg-[#3A172F] hover:text-white ${sidebarCollapsed ? 'px-0' : ''}`}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <ChatPdfNavigation
            collapsed={sidebarCollapsed}
            onUpload={onUpload}
            onHistory={onHistory ?? (() => {})}
            onReset={() => {
              setActiveChatPdfDocumentId(null);
              setActiveChatPdfDocumentIds([]);
              setActiveChatPdfConversationId(null);
              navigate('/chat-with-pdf');
              window.dispatchEvent(new CustomEvent('chat-pdf-reset'));
            }}
            onNavigate={navigate}
            activeLabel={navActive}
          />

        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#1A1A1A] bg-[#000000] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Back to dashboard"
                onClick={() => navigate('/')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1A1A1A] bg-[#0A0A0A] text-[#dfe7ef] transition hover:border-[#FF66B8] hover:text-[#FFE3F0]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#232323] bg-[#050505] text-[#dfe7ef] md:hidden"
              >
                {menuOpen ? <X className="h-4 w-4" /> : (
                  <div className="flex flex-col gap-1.5">
                    <span className="block h-0.5 w-4 rounded-full bg-current" />
                    <span className="block h-0.5 w-4 rounded-full bg-current" />
                    <span className="block h-0.5 w-4 rounded-full bg-current" />
                  </div>
                )}
              </button>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#6b7786]">{subtitle}</div>
                <div className="truncate text-sm font-semibold text-white">{title}</div>
              </div>
            </div>

            <PdfToolsMenu />
          </header>

          {menuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMenuOpen(false)}
                className="absolute inset-0 bg-black/70"
              />
              <aside className="relative flex h-full w-[min(85vw,240px)] flex-col border-r border-[#1A1A1A] bg-[#090909] p-3 shadow-[12px_0_30px_rgba(0,0,0,0.35)]">
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#718194] transition hover:bg-[#171717] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ChatPdfNavigation
                  mobile
                  onUpload={() => { setMenuOpen(false); onUpload(); }}
                  onHistory={() => { setMenuOpen(false); onHistory?.(); }}
                  onReset={() => { setMenuOpen(false); setActiveChatPdfDocumentId(null); setActiveChatPdfDocumentIds([]); setActiveChatPdfConversationId(null); navigate('/chat-with-pdf'); window.dispatchEvent(new CustomEvent('chat-pdf-reset')); }}
                  onNavigate={(route) => { setMenuOpen(false); navigate(route); }}
                  activeLabel={navActive}
                />
              </aside>
            </div>
          )}

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-[#000000] px-3 pb-32 pt-4 md:px-5" data-chat-scroll-container>{children}</div>
        </main>
      </div>
    </ChatViewport>
  );
}

function ChatPdfWorkspacePage() {
  const [, navigate] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<ChatPdfDocument[]>(() => loadChatPdfDocuments());
  const [activeDocumentIds, setActiveDocumentIdsState] = useState<string[]>(() => getActiveChatPdfDocumentIds());
  const [viewedDocumentId, setViewedDocumentIdState] = useState<string | null>(() => getViewedChatPdfDocumentId());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<Array<{ id: string; fileName: string; size: number }>>([]);
  const [retryFiles, setRetryFiles] = useState<File[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ChatPdfConversation[]>(() => loadChatPdfHistory());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [messageActionFeedback, setMessageActionFeedback] = useState<{ id: string; label: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedDocuments = documents.filter((document) => activeDocumentIds.includes(document.id) && document.status === 'ready');
  const activeDocument = selectedDocuments.find((document) => document.id === viewedDocumentId) ?? selectedDocuments[0] ?? null;

  const getPdfRequestContext = (selected: ChatPdfDocument[]) => ({
    pdfDocumentId: selected.map((document) => document.id).join(','),
    pdfDocumentName: selected.map((document) => document.fileName).join(', '),
    pdfDocumentStatus: selected.map((document) => document.status).join(','),
    pdfContext: `Extracted text attached in prompt for ${selected.length} selected PDF document(s).`,
  });

  const refreshHistory = () => setHistory(loadChatPdfHistory());
  const openConversation = (conversation: ChatPdfConversation) => {
    const storedDocuments = loadChatPdfDocuments();
    const documentIds = conversation.documentIds?.filter((id) => storedDocuments.some((document) => document.id === id)) ?? (conversation.documentId ? [conversation.documentId] : []);
    const viewedId = conversation.viewedDocumentId ?? conversation.documentId ?? documentIds[0] ?? null;
    setDocuments(storedDocuments);
    setActiveDocumentIdsState(conversation.activeDocumentIds?.filter((id) => documentIds.includes(id)) ?? documentIds);
    setViewedDocumentIdState(viewedId);
    setMessages(conversation.messages);
    setConversationId(conversation.id);
    setActiveChatPdfConversationId(conversation.id);
    setActiveChatPdfDocumentIds(conversation.activeDocumentIds?.filter((id) => documentIds.includes(id)) ?? documentIds);
    setActiveChatPdfDocumentId(viewedId);
    setViewedChatPdfDocumentId(viewedId);
    setHistoryOpen(false);
  };

  const createNewChat = () => {
    setMessages([]);
    setMessage('');
    setConversationId(null);
    setGeneratedTitle('');
    setActiveChatPdfConversationId(null);
    setHistoryOpen(false);
  };

  // Auto-scroll to latest message when messages change or loading state changes
  useEffect(() => {
    // Small delay to ensure DOM has rendered the new message
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  useEffect(() => {
    const applyStoredState = () => {
      const storedDocuments = loadChatPdfDocuments();
      const storedActiveIds = getActiveChatPdfDocumentIds().filter((id) => storedDocuments.some((document) => document.id === id));
      const storedViewedId = getViewedChatPdfDocumentId();
      const storedConversationId = getActiveChatPdfConversationId();
      setDocuments(storedDocuments);
      setActiveDocumentIdsState(storedActiveIds);
      setViewedDocumentIdState(storedDocuments.some((document) => document.id === storedViewedId) ? storedViewedId : storedActiveIds[0] ?? storedDocuments[0]?.id ?? null);
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
      setDocuments([]);
      setActiveDocumentIdsState([]);
      setViewedDocumentIdState(null);
      setConversationId(null);
      setMessages([]);
      setMessage('');
      setError('');
    };

    window.addEventListener('chat-pdf-reset', handleReset);
    return () => window.removeEventListener('chat-pdf-reset', handleReset);
  }, []);

  const persistConversation = (nextMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>, customDocument?: ChatPdfDocument | null) => {
    const finalDocument = customDocument ?? documents.find((document) => document.id === viewedDocumentId) ?? null;
    const nextId = conversationId ?? createPdfConversationId();
    setConversationId(nextId);
    setActiveChatPdfConversationId(nextId);

    const selectedDocuments = documents.filter((document) => activeDocumentIds.includes(document.id));
    const docName = finalDocument?.name ?? selectedDocuments[0]?.name ?? null;
    const nextConversation: ChatPdfConversation = {
      id: nextId,
      title: generatedTitle || getConversationTitle(docName),
      documentId: finalDocument?.id ?? selectedDocuments[0]?.id ?? null,
      documentName: docName,
      documentIds: selectedDocuments.map((document) => document.id),
      activeDocumentIds,
      viewedDocumentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };
    upsertChatPdfConversation(nextConversation);
    refreshHistory();
  };

  const copyMessage = async (messageId: string, content: string, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(content);
      setMessageActionFeedback({ id: messageId, label });
    } catch {
      setError('Could not copy this message. Please try again.');
    }
  };

  const shareMessage = async (messageId: string, content: string) => {
    const title = activeDocument ? `${activeDocument.name} — PDF response` : 'PDF chat response';
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title,
          text: content,
          url: window.location.href,
        });
        setMessageActionFeedback({ id: messageId, label: 'Shared' });
        return;
      }

      await copyMessage(
        messageId,
        `${content}\n\nShared from PDF chat: ${window.location.href}`,
        'Share text copied',
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setError('Could not share this response. Please try again.');
    }
  };

  const beginEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingMessageText(content);
    setMessageActionFeedback(null);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const saveEditedMessage = (messageId: string) => {
    const content = editingMessageText.trim();
    if (!content) {
      setError('A message cannot be empty.');
      return;
    }

    const nextMessages = messages.map((item) => (
      item.id === messageId ? { ...item, content } : item
    ));
    setMessages(nextMessages);
    persistConversation(nextMessages);
    setEditingMessageId(null);
    setEditingMessageText('');
    setMessageActionFeedback({ id: messageId, label: 'Saved' });
    setError('');
  };

  const handleUpload = async (files?: File | File[] | null) => {
    const selectedFiles = files
      ? Array.isArray(files) ? files : [files]
      : Array.from(inputRef.current?.files ?? []);
    if (!selectedFiles.length) return;

    const invalidFile = selectedFiles.find((file) => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'));
    if (invalidFile) {
      setError(`Please upload valid PDF files. "${invalidFile.name}" is not a PDF.`);
      return;
    }

    const existingNames = new Set(documents.map((document) => document.fileName));
    const filesToProcess = selectedFiles.filter((file) => !existingNames.has(file.name));
    if (!filesToProcess.length) {
      setError('Those PDFs are already in this session.');
      return;
    }
    if (documents.length + filesToProcess.length > MAX_CHAT_PDF_FILES) {
      setError(`You can keep up to ${MAX_CHAT_PDF_FILES} PDFs in one session.`);
      return;
    }
    const oversizedFile = filesToProcess.find((file) => file.size > MAX_CHAT_PDF_FILE_SIZE);
    if (oversizedFile) {
      setError(`"${oversizedFile.name}" exceeds the ${Math.round(MAX_CHAT_PDF_FILE_SIZE / 1024 / 1024)} MB per-file limit.`);
      return;
    }
    const totalSize = documents.reduce((total, document) => total + document.size, 0) + filesToProcess.reduce((total, file) => total + file.size, 0);
    if (totalSize > MAX_CHAT_PDF_TOTAL_SIZE) {
      setError(`These files exceed the ${Math.round(MAX_CHAT_PDF_TOTAL_SIZE / 1024 / 1024)} MB combined session limit.`);
      return;
    }

    setUploading(true);
    setError('');
    setRetryFiles(filesToProcess);
    setProcessingFiles(filesToProcess.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      fileName: file.name,
      size: file.size,
    })));
    const processed: ChatPdfDocument[] = [];
    const failures: Array<{ file: File; reason: string }> = [];
    for (const file of filesToProcess) {
      try {
        const document = await extractPdfText(file);
        processed.push(document);
        addChatPdfDocument(document);
      } catch (err) {
        failures.push({
          file,
          reason: err instanceof Error ? err.message : 'The PDF processor could not read this file.',
        });
      }
    }
    setProcessingFiles([]);
    const nextDocuments = [...documents, ...processed];
    const nextActiveIds = [...new Set([...activeDocumentIds, ...processed.map((document) => document.id)])];
    const viewedId = processed.at(-1)?.id ?? viewedDocumentId ?? nextDocuments[0]?.id ?? null;
    setDocuments(nextDocuments);
    setActiveDocumentIdsState(nextActiveIds);
    setViewedDocumentIdState(viewedId);
    setActiveChatPdfDocumentIds(nextActiveIds);
    if (viewedId) {
      setActiveChatPdfDocumentId(viewedId);
      setViewedChatPdfDocumentId(viewedId);
      setGeneratedTitle(nextDocuments.find((document) => document.id === viewedId)?.name ?? 'PDF discussion');
    }
    if (failures.length) {
      setRetryFiles(failures.map(({ file }) => file));
      const reason = failures.length === 1
        ? `${failures[0].file.name}: ${failures[0].reason}`
        : failures.map(({ file, reason: fileReason }) => `${file.name}: ${fileReason}`).join(' ');
      setError(reason);
    } else {
      setRetryFiles([]);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const sendPrompt = async (customPrompt?: string) => {
    const value = (customPrompt ?? message).trim();
    if (!value) return;
    if (uploading) {
      setError('Processing PDF…');
      return;
    }
    if (!selectedDocuments.length) {
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
      const grounded = buildGroundedPrompt(value, selectedDocuments);
      const pdfInput = getPdfRequestContext(selectedDocuments);
      console.debug('[chat-pdf] generation request', { selectedDocuments: selectedDocuments.map(({ id, fileName, status }) => ({ id, fileName, status })), payloadKeys: ['toolId', 'inputs.prompt', 'inputs.mode', ...Object.keys(pdfInput)] });
      const reply = await generateHubResponse('ai-assistant', { prompt: grounded, mode: 'Chat with PDF', ...pdfInput });
      const assistantMessage: { id: string; role: 'assistant'; content: string; createdAt: string } = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      const finalMessages: Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }> = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      persistConversation(finalMessages, activeDocument);
      const viewedDocument = documents.find((document) => document.id === viewedDocumentId) ?? selectedDocuments[0];
      const pages = inferRelevantPages(value, viewedDocument.pageTexts);
      if (pages[0]) {
        setGeneratedTitle(`${viewedDocument.name} — page ${pages[0]}`);
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
    if (uploading) {
      setError('Processing PDF…');
      return;
    }
    if (!selectedDocuments.length) {
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
      const grounded = buildGroundedPrompt(promptText, selectedDocuments);
      const pdfInput = getPdfRequestContext(selectedDocuments);
      console.debug('[chat-pdf] context action request', { selectedDocuments: selectedDocuments.map(({ id, fileName, status }) => ({ id, fileName, status })), payloadKeys: ['toolId', 'inputs.prompt', 'inputs.mode', ...Object.keys(pdfInput)] });
      const reply = await generateHubResponse('ai-assistant', { prompt: grounded, mode: type === 'summary' ? 'Summarize' : type === 'extract' ? 'Extract Information' : 'Analyze', ...pdfInput });
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
      saveCurrentResponse(type, `${type.charAt(0).toUpperCase()}${type.slice(1)}: ${selectedDocuments.map((document) => document.name).join(', ')}`, reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The workspace could not generate the requested result.');
    } finally {
      setLoading(false);
    }
  };

  const selectDocument = (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document || document.status !== 'ready') return;
    setViewedDocumentIdState(documentId);
    setActiveDocumentIdsState([documentId]);
    setActiveChatPdfDocumentIds([documentId]);
    setViewedChatPdfDocumentId(documentId);
    setActiveChatPdfDocumentId(documentId);
  };

  const toggleDocument = (documentId: string) => {
    const nextIds = activeDocumentIds.includes(documentId)
      ? activeDocumentIds.filter((id) => id !== documentId)
      : [...activeDocumentIds, documentId];
    setActiveDocumentIdsState(nextIds);
    setActiveChatPdfDocumentIds(nextIds);
  };

  const removeDocument = (documentId: string) => {
    const nextDocuments = documents.filter((document) => document.id !== documentId);
    const nextActiveIds = activeDocumentIds.filter((id) => id !== documentId);
    const nextViewedId = viewedDocumentId === documentId ? nextDocuments[0]?.id ?? null : viewedDocumentId;
    setDocuments(nextDocuments);
    setActiveDocumentIdsState(nextActiveIds);
    setViewedDocumentIdState(nextViewedId);
    setActiveChatPdfDocumentIds(nextActiveIds);
    setViewedChatPdfDocumentId(nextViewedId);
    removeChatPdfDocument(documentId);
  };

  return (
    <>
      <ChatPdfShell
        title="Chat with PDF"
        subtitle="Upload and chat with your document."
        navActive="Chat with PDF"
        activeDocumentName={activeDocument?.name ?? null}
        onUpload={() => inputRef.current?.click()}
        onHistory={() => { refreshHistory(); setHistoryOpen(true); }}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
      >
          <div
          className="mx-auto max-w-6xl"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleUpload(Array.from(event.dataTransfer.files));
          }}
        >
          {(documents.length > 0 || processingFiles.length > 0) && (
            <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-[22px] border border-[#1A1A1A] bg-[#0b1016] p-3 [scrollbar-width:none]">
              {documents.map((document) => {
                const selected = activeDocumentIds.includes(document.id);
                const viewed = viewedDocumentId === document.id;
                return (
                  <div key={document.id} className={`flex shrink-0 items-center gap-1 rounded-xl border px-2 py-1.5 text-xs ${viewed ? 'border-[#FF66B8] bg-[#3A172F]' : 'border-[#1A1A1A] bg-[#101010]'}`}>
                    <button type="button" onClick={() => selectDocument(document.id)} className="flex max-w-[180px] items-center gap-1.5 truncate text-left text-[#dfeaf8]" title={`View ${document.fileName}`}>
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#FFB5D9]" />
                      <span className="truncate">{document.fileName}</span>
                    </button>
                    <button type="button" onClick={() => toggleDocument(document.id)} aria-label={`${selected ? 'Deselect' : 'Select'} ${document.fileName}`} className={`text-sm ${selected ? 'text-[#FF8CC3]' : 'text-[#718194]'}`}>{selected ? '✓' : '○'}</button>
                    <button type="button" onClick={() => removeDocument(document.id)} aria-label={`Remove ${document.fileName}`} className="text-[#718194] hover:text-red-300">×</button>
                  </div>
                );
              })}
              {processingFiles.map((file) => (
                <div key={file.id} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#71345A] bg-[#3A172F] px-2.5 py-1.5 text-xs text-[#FFB5D9]">
                  <Clock3 className="h-3.5 w-3.5 animate-pulse" />
                  <span>Processing {file.fileName}…</span>
                </div>
              ))}
              <button type="button" onClick={() => inputRef.current?.click()} className="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-[#71345A] px-2.5 py-1.5 text-xs font-medium text-[#FFB5D9] hover:bg-[#3A172F]">+ Add PDF</button>
              <button type="button" onClick={() => { const ids = documents.map((document) => document.id); setActiveDocumentIdsState(ids); setActiveChatPdfDocumentIds(ids); }} className="ml-auto shrink-0 px-2 text-[11px] text-[#FFB5D9]">Select all</button>
              <button type="button" onClick={() => { setActiveDocumentIdsState([]); setActiveChatPdfDocumentIds([]); }} className="shrink-0 px-2 text-[11px] text-[#FFB5D9]">Deselect all</button>
            </div>
          )}
          {activeDocument?.warning && (
            <div className="mb-4 rounded-2xl border border-amber-900/60 bg-amber-950/20 px-3 py-2 text-[12px] leading-5 text-amber-200">
              {activeDocument.warning}
            </div>
          )}
          {activeDocument && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CHAT_PDF_QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setMessage(`${action}: `)}
                  className="shrink-0 rounded-full border border-[#71345A] bg-[#121212] px-3 py-1.5 text-[11px] text-[#FFB5D9] transition hover:bg-[#3A172F]"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          {activeDocument ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
              <div className="space-y-3">
                {messages.length > 0 && (
                  <div className="space-y-3">
                    {messages.map((item) => (
                      <div key={item.id} className={`flex flex-col gap-1 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[88%] rounded-[20px] px-3.5 py-2.5 text-[14px] leading-6 ${item.role === 'user' ? 'bg-[#0b1320] text-[#ebf5ff]' : 'bg-[#101010] text-[#dfeaf8]'}`}>
                          {editingMessageId === item.id ? (
                            <div className="min-w-[min(72vw,420px)]">
                              <textarea
                                autoFocus
                                value={editingMessageText}
                                onChange={(event) => setEditingMessageText(event.target.value)}
                                onKeyDown={(event) => {
                                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                                    event.preventDefault();
                                    saveEditedMessage(item.id);
                                  }
                                  if (event.key === 'Escape') cancelEditMessage();
                                }}
                                rows={3}
                                className="w-full resize-y rounded-xl border border-[#71345A] bg-[#050505] px-3 py-2 text-[14px] leading-6 text-white outline-none focus:border-[#FF66B8]"
                                aria-label="Edit message"
                              />
                              <div className="mt-2 flex items-center justify-end gap-2 text-[11px]">
                                <button type="button" onClick={cancelEditMessage} className="rounded-lg px-2 py-1 text-[#9aa7b7] hover:bg-white/5 hover:text-white">Cancel</button>
                                <button type="button" onClick={() => saveEditedMessage(item.id)} className="flex items-center gap-1 rounded-lg bg-[#FF66B8]/15 px-2 py-1 font-semibold text-[#FFB5D9] hover:bg-[#FF66B8]/25">
                                  <Check className="h-3.5 w-3.5" />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.role === 'assistant' ? (
                                <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:rounded-xl prose-pre:border prose-pre:border-[#262626] prose-pre:bg-[#050505] prose-pre:p-3">
                                  <ReactMarkdown>{item.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap">{item.content}</div>
                              )}
                            </>
                          )}
                        </div>
                        {editingMessageId !== item.id && (
                          <div className={`flex w-full max-w-[88%] flex-wrap items-center gap-1 text-[11px] ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.role === 'user' && (
                              <button
                                type="button"
                                onClick={() => beginEditMessage(item.id, item.content)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#8f9aad] transition hover:bg-white/5 hover:text-white"
                                aria-label="Edit message"
                                title="Edit message"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void copyMessage(item.id, item.content)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#8f9aad] transition hover:bg-white/5 hover:text-white"
                              aria-label={messageActionFeedback?.id === item.id && messageActionFeedback.label === 'Copied' ? 'Copied' : 'Copy message'}
                              title="Copy message"
                            >
                              {messageActionFeedback?.id === item.id && messageActionFeedback.label === 'Copied' ? <Check className="h-3.5 w-3.5 text-[#FFB5D9]" /> : <Copy className="h-3.5 w-3.5" />}
                              {messageActionFeedback?.id === item.id && messageActionFeedback.label === 'Copied' ? 'Copied' : 'Copy'}
                            </button>
                            {item.role === 'assistant' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void shareMessage(item.id, item.content)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#8f9aad] transition hover:bg-white/5 hover:text-white"
                                  aria-label="Share response"
                                  title="Share response"
                                >
                                  <Share2 className="h-3.5 w-3.5" />
                                  Share
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    saveCurrentResponse('result', `Response: ${activeDocument?.name ?? 'PDF chat'}`, item.content);
                                    setMessageActionFeedback({ id: item.id, label: 'Saved' });
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[#8f9aad] transition hover:bg-white/5 hover:text-white"
                                  aria-label="Save response"
                                  title="Save response"
                                >
                                  <Bookmark className="h-3.5 w-3.5" />
                                  Save
                                </button>
                              </>
                            )}
                            {messageActionFeedback?.id === item.id && messageActionFeedback.label !== 'Copied' && (
                              <span className="px-1 text-[#FFB5D9]" role="status">{messageActionFeedback.label}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {loading && (
                      <div key="loading" className="flex justify-start">
                        <div className="max-w-[88%] rounded-[20px] bg-[#101010] px-3.5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#FF66B8] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="inline-block h-2 w-2 rounded-full bg-[#FF66B8] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="inline-block h-2 w-2 rounded-full bg-[#FF66B8] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-[12px] text-[#FFB5D9]">Thinking…</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
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
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#6b7786]">AI context</div>
                    <div className="mt-1 font-medium text-[#FFB5D9]">{activeDocumentIds.length} document{activeDocumentIds.length === 1 ? '' : 's'} selected</div>
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
            <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center p-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3A172F] text-[#FF66B8]">
                  <Upload className="h-6 w-6" />
                </div>
                <h2 className="text-[22px] font-semibold tracking-tight text-white">Chat with your PDFs</h2>
                <p className="mt-3 text-sm leading-6 text-[#8f9aad]">Upload a PDF and ask questions, summarize content, extract information, or analyze the document.</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-full border border-[#FF66B8]/60 bg-[#FF66B8]/15 px-4 py-2 text-[12px] font-semibold text-[#FFB5D9] transition hover:bg-[#FF66B8]/25">+ Upload PDF</button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-[12px] text-red-200">
              <span>{error}</span>
              <div className="flex shrink-0 items-center gap-3">
                {retryFiles.length > 0 && !uploading && (
                  <button type="button" onClick={() => void handleUpload(retryFiles)} className="font-semibold text-white underline">Retry</button>
                )}
                <button type="button" onClick={() => setError('')} className="font-semibold text-white underline">Dismiss</button>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-4 rounded-2xl border border-[#1A1A1A] bg-[#101010] px-3 py-2 text-sm text-[#cfe5ff]">Processing PDF…</div>
          )}

          <div className={`pointer-events-none fixed bottom-0 right-0 z-40 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-6 ${sidebarCollapsed ? 'left-0 md:left-[76px]' : 'left-0 md:left-[240px]'}`}>
            <div className="pointer-events-auto relative mx-auto max-w-5xl rounded-[26px] border border-[#1a1a1a] bg-[#0b0f12] p-2 shadow-[0_-10px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#71345A] bg-[#3A172F] text-[#FFD1E5] transition hover:border-[#FF66B8] hover:bg-[#592343]" aria-label="Upload PDF">
                  <Upload className="h-4 w-4" />
                </button>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && !loading) {
                      event.preventDefault();
                      void sendPrompt();
                    }
                  }}
                  rows={1}
                  disabled={loading}
                  placeholder={activeDocument ? 'Ask anything about this PDF…' : 'Upload a PDF to begin…'}
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-[14px] leading-5 text-[#edf4ff] placeholder:text-[#6c7784] outline-none disabled:opacity-60"
                />

                {activeDocumentIds.length > 0 && (
                  <div className="absolute bottom-14 left-14 text-[10px] text-[#FFB5D9]">Using {activeDocumentIds.length} document{activeDocumentIds.length === 1 ? '' : 's'}</div>
                )}

                <button 
                  type="button" 
                  onClick={() => { if (!loading) { const next = message.trim(); if (next) void sendPrompt(next); } }} 
                  disabled={loading || !activeDocument || !message.trim()}
                  aria-label={loading ? 'Generating response' : 'Send message'} 
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF66B8] text-[#1B0712] shadow-[0_8px_18px_rgba(255,102,184,0.35)] transition hover:bg-[#FF8CC3] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex gap-0.5">
                      <span className="inline-block h-1 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block h-1 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="inline-block h-1 w-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ChatPdfShell>

      {historyOpen && (
        <div className="fixed inset-0 z-[60]">
          <button type="button" aria-label="Close history" onClick={() => setHistoryOpen(false)} className="absolute inset-0 bg-black/70" />
          <aside className="relative flex h-full w-[min(88vw,360px)] flex-col border-r border-[#242424] bg-[#090909] p-4 shadow-[12px_0_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#1A1A1A] pb-4">
              <div>
                <div className="text-sm font-semibold text-white">Chat history</div>
                <div className="mt-1 text-xs text-[#718194]">Your PDF conversations</div>
              </div>
              <button type="button" aria-label="Close history" onClick={() => setHistoryOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#718194] hover:bg-[#171717] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={createNewChat} className="mt-4 flex items-center gap-2 rounded-xl border border-[#71345A] bg-[#3A172F] px-3 py-2.5 text-left text-sm font-medium text-[#FFD1E5] hover:bg-[#592343]"><Plus className="h-4 w-4" /> New chat</button>
            <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#242424] p-4 text-center text-xs text-[#718194]">No saved PDF conversations yet.</div>
              ) : history.map((conversation) => (
                <div key={conversation.id} className="group rounded-xl border border-[#1A1A1A] bg-[#101010] p-3 hover:border-[#71345A]">
                  <button type="button" onClick={() => openConversation(conversation)} className="w-full min-w-0 text-left">
                    <div className="truncate text-sm font-medium text-white">{conversation.title}</div>
                    <div className="mt-1 truncate text-xs text-[#9aa9ba]">{conversation.documentName ?? 'Untitled PDF'}</div>
                    <div className="mt-1 text-[11px] text-[#718194]">{formatDate(conversation.updatedAt)}</div>
                  </button>
                  <div className="mt-2 flex gap-3 text-[11px]">
                    <button type="button" onClick={() => { const title = window.prompt('Rename conversation', conversation.title)?.trim(); if (!title) return; upsertChatPdfConversation({ ...conversation, title, updatedAt: new Date().toISOString() }); refreshHistory(); }} className="text-[#FFB5D9] hover:text-white">Rename</button>
                    <button type="button" onClick={() => { deleteChatPdfConversation(conversation.id); refreshHistory(); }} className="text-red-300 hover:text-red-200">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(event) => { void handleUpload(Array.from(event.target.files ?? [])); }}
      />
    </>
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
      const reply = await generateHubResponse('ai-assistant', {
        prompt: buildGroundedPrompt(promptText, [activeDocument]),
        mode: toolName,
        pdfDocumentId: activeDocument.id,
        pdfDocumentName: activeDocument.fileName,
        pdfDocumentStatus: activeDocument.status,
        pdfContext: 'Extracted text attached in prompt for the selected PDF document.',
      });
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
  const [documentsMatch] = useRoute('/chat-with-pdf/documents');
  const [toolsMatch] = useRoute('/chat-with-pdf/tools');
  const [savedMatch] = useRoute('/chat-with-pdf/saved');

  if (documentsMatch) return <ChatPdfDocumentsPage />;
  if (toolsMatch) return <ChatPdfToolsPage />;
  if (savedMatch) return <ChatPdfSavedPage />;
  if (workspaceMatch) return <ChatPdfWorkspacePage />;

  return null;
}
