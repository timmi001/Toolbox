export type ChatPdfMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type ChatPdfConversation = {
  id: string;
  title: string;
  documentId?: string | null;
  documentName?: string | null;
  documentIds?: string[];
  activeDocumentIds?: string[];
  viewedDocumentId?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatPdfMessage[];
};

export type ChatPdfDocument = {
  id: string;
  name: string;
  fileName: string;
  mimeType?: string;
  pageCount: number;
  pageTexts: string[];
  uploadDate: string;
  status: 'processing' | 'ready' | 'error';
  size: number;
  textAvailable?: boolean;
  warning?: string;
};

export type ChatPdfSavedItem = {
  id: string;
  type: 'summary' | 'extract' | 'analysis' | 'result';
  title: string;
  content: string;
  documentId?: string | null;
  documentName?: string | null;
  page?: number;
  createdAt: string;
};

const DOCS_KEY = 'toolboxx-chat-pdf-documents';
const ACTIVE_DOC_KEY = 'toolboxx-chat-pdf-active-document';
const ACTIVE_DOCS_KEY = 'toolboxx-chat-pdf-active-documents';
const VIEWED_DOC_KEY = 'toolboxx-chat-pdf-viewed-document';
const ACTIVE_CONVO_KEY = 'toolboxx-chat-pdf-active-conversation';
const HISTORY_KEY = 'toolboxx-chat-pdf-history';
const SAVED_KEY = 'toolboxx-chat-pdf-saved';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota issues
  }
}

export function loadChatPdfDocuments(): ChatPdfDocument[] {
  return readJson<ChatPdfDocument[]>(DOCS_KEY, []);
}

export function saveChatPdfDocuments(documents: ChatPdfDocument[]) {
  writeJson(DOCS_KEY, documents);
}

export function addChatPdfDocument(document: ChatPdfDocument) {
  const docs = loadChatPdfDocuments();
  const next = [document, ...docs.filter((item) => item.id !== document.id)];
  saveChatPdfDocuments(next);
  return next;
}

export function updateChatPdfDocument(document: ChatPdfDocument) {
  const docs = loadChatPdfDocuments();
  const next = docs.map((item) => (item.id === document.id ? document : item));
  saveChatPdfDocuments(next);
  return next;
}

export function removeChatPdfDocument(documentId: string) {
  const docs = loadChatPdfDocuments();
  const next = docs.filter((item) => item.id !== documentId);
  saveChatPdfDocuments(next);
  setActiveChatPdfDocumentIds(getActiveChatPdfDocumentIds().filter((id) => id !== documentId));
  if (getViewedChatPdfDocumentId() === documentId) setViewedChatPdfDocumentId(next[0]?.id ?? null);
  return next;
}

export function getActiveChatPdfDocumentId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_DOC_KEY) ?? null;
}

export function setActiveChatPdfDocumentId(documentId: string | null) {
  if (typeof window === 'undefined') return;
  if (documentId) {
    window.localStorage.setItem(ACTIVE_DOC_KEY, documentId);
    return;
  }
  window.localStorage.removeItem(ACTIVE_DOC_KEY);
}

export function getActiveChatPdfDocumentIds(): string[] {
  const stored = readJson<string[]>(ACTIVE_DOCS_KEY, []);
  if (stored.length) return stored;
  const legacyId = getActiveChatPdfDocumentId();
  return legacyId ? [legacyId] : [];
}

export function setActiveChatPdfDocumentIds(documentIds: string[]) {
  const uniqueIds = [...new Set(documentIds)];
  writeJson(ACTIVE_DOCS_KEY, uniqueIds);
  setActiveChatPdfDocumentId(uniqueIds[0] ?? null);
}

export function getViewedChatPdfDocumentId(): string | null {
  return readJson<string | null>(VIEWED_DOC_KEY, getActiveChatPdfDocumentId());
}

export function setViewedChatPdfDocumentId(documentId: string | null) {
  if (typeof window === 'undefined') return;
  if (documentId) {
    window.localStorage.setItem(VIEWED_DOC_KEY, documentId);
  } else {
    window.localStorage.removeItem(VIEWED_DOC_KEY);
  }
}

export function getActiveChatPdfDocument(): ChatPdfDocument | null {
  const activeId = getActiveChatPdfDocumentId();
  if (!activeId) return null;
  return loadChatPdfDocuments().find((item) => item.id === activeId) ?? null;
}

export function setActiveChatPdfDocument(document: ChatPdfDocument | null) {
  if (!document) {
    setActiveChatPdfDocumentId(null);
    return;
  }
  setActiveChatPdfDocumentId(document.id);
  addChatPdfDocument(document);
}

export function loadChatPdfHistory(): ChatPdfConversation[] {
  return readJson<ChatPdfConversation[]>(HISTORY_KEY, []).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function saveChatPdfHistory(history: ChatPdfConversation[]) {
  writeJson(HISTORY_KEY, history);
}

export function upsertChatPdfConversation(conversation: ChatPdfConversation) {
  const history = loadChatPdfHistory();
  const next = [conversation, ...history.filter((item) => item.id !== conversation.id)];
  saveChatPdfHistory(next);
  return next;
}

export function deleteChatPdfConversation(conversationId: string) {
  const history = loadChatPdfHistory();
  const next = history.filter((item) => item.id !== conversationId);
  saveChatPdfHistory(next);
  const activeId = getActiveChatPdfConversationId();
  if (activeId === conversationId) {
    setActiveChatPdfConversationId(null);
  }
  return next;
}

export function getActiveChatPdfConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_CONVO_KEY) ?? null;
}

export function setActiveChatPdfConversationId(conversationId: string | null) {
  if (typeof window === 'undefined') return;
  if (conversationId) {
    window.localStorage.setItem(ACTIVE_CONVO_KEY, conversationId);
    return;
  }
  window.localStorage.removeItem(ACTIVE_CONVO_KEY);
}

export function loadChatPdfSavedItems(): ChatPdfSavedItem[] {
  return readJson<ChatPdfSavedItem[]>(SAVED_KEY, []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveChatPdfSavedItems(items: ChatPdfSavedItem[]) {
  writeJson(SAVED_KEY, items);
}

export function addChatPdfSavedItem(item: ChatPdfSavedItem) {
  const items = loadChatPdfSavedItems();
  const next = [item, ...items.filter((entry) => entry.id !== item.id)];
  saveChatPdfSavedItems(next);
  return next;
}

export function removeChatPdfSavedItem(itemId: string) {
  const items = loadChatPdfSavedItems();
  const next = items.filter((item) => item.id !== itemId);
  saveChatPdfSavedItems(next);
  return next;
}

export function createPdfConversationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `chat-pdf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPdfItemId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `pdf-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
