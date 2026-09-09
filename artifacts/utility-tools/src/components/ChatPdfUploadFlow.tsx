import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import {
  BookOpen,
  Copy,
  Download,
  FileText,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  UploadCloud,
  Volume2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type ViewMode = 'chat' | 'document';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export default function ChatPdfUploadFlow() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Welcome back. I reviewed the uploaded material and can summarize key ideas, explain cost accounting terms, and answer your questions.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const suggestions = [
    'Summarize the key functions of cost accounting',
    'How does cost accounting assist in planning and decision-making?',
    'What are the main advantages of implementing cost accounting in a business?',
  ];

  const handleFiles = async (fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.doc') && !file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a supported PDF, DOC, DOCX, or TXT file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      setUploadedFile(file);
      setDocumentText(text || 'No readable text content was found in the uploaded file.');
      setViewMode('chat');
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I went through all ${file.name ? 'the uploaded pages' : 'the uploaded document'} and can help you unpack the concepts!`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The file could not be read.');
    } finally {
      setLoading(false);
    }
  };

  const onInputFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      void handleFiles(event.target.files);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files?.length) {
      void handleFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-[#eef3f8]">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#121822] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#aee3ff]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#91a3b9]">ToolboxX</div>
              <div className="text-sm font-semibold text-white">Chat with PDF</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-[#dce7f4] transition hover:bg-white/8"
              onClick={() => inputRef.current?.click()}
            >
              <span className="inline-flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload PDF
              </span>
            </button>
          </div>
        </header>

        {!uploadedFile ? (
          <main className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="w-full max-w-3xl">
              <div className="mb-8 text-center">
                <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#8aa7ff] bg-[#101a2c] text-[#8aa7ff]">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Upload a document</h1>
                <p className="mt-3 text-sm text-[#9aa7b8]">Drop your PDF, DOC, DOCX, or TXT file to start a study conversation.</p>
              </div>

              <div
                className={`relative rounded-[30px] border border-dashed p-8 text-center transition ${dragActive ? 'border-[#9ad5ff] bg-[#101b2b]' : 'border-[#66728b] bg-[#111826]'}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                  onChange={onInputFile}
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="group flex w-full flex-col items-center justify-center gap-4 outline-none"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2940] text-[#aee3ff] transition group-hover:scale-105 group-hover:bg-[#233a62]">
                    <UploadCloud className="h-8 w-8" />
                  </span>
                  <span className="text-base font-medium text-[#dce9f9]">Drop files here or click to browse</span>
                  <span className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9aa7b8]">
                    Max 25 MB
                  </span>
                </button>

                {loading && (
                  <div className="mt-5 text-sm font-medium text-[#9bdcff]">Reading document…</div>
                )}

                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex min-h-0 flex-1 flex-col bg-[#f8f6ee] text-[#18212d]">
            <section className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#111722] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#b9ddff]">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{uploadedFile.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Toggle to document view"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${viewMode === 'document' ? 'border-[#b7d8ff] bg-[#ddeaff] text-[#0c1320]' : 'border-white/10 bg-white/5 text-[#dce7f4] hover:bg-white/10'}`}
                  onClick={() => setViewMode(viewMode === 'chat' ? 'document' : 'chat')}
                >
                  {viewMode === 'chat' ? <FileText className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                </button>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {viewMode === 'chat' ? (
                <section className="flex min-h-0 flex-1 flex-col bg-[#f8f6ee]">
                  <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="mx-auto max-w-4xl">
                      <section className="rounded-[24px] border border-[#d8d3c4] bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8dfff] text-[#5b3fb5]">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="flex-1 rounded-2xl bg-[#f7f4ea] px-4 py-3 text-[14px] leading-6 text-[#30415b]">
                            <div className="mb-2 text-[13px] font-medium text-[#53647d]">AI Assistant</div>
                            <p className="m-0">
                              cost accounting is, defines key terms like cost and costing, outlines its purposes,
                              and highlights the advantages such as identifying profitable products and improving efficiency.
                            </p>
                            <p className="mt-3 m-0">
                              I went through all 67 pages and can help you unpack the concepts!
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {suggestions.map((suggestion, index) => (
                            <button
                              type="button"
                              key={suggestion}
                              className={`rounded-2xl border px-3 py-3 text-left shadow-sm transition hover:shadow-md ${index === 0 ? 'border-[#6c47ff] bg-white text-[#43336d]' : 'border-[#e3dcca] bg-white text-[#30415b]'}`}
                            >
                              <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold">
                                <FileText className="h-4 w-4" />
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="mr-2 text-sm font-semibold text-[#344054]">Create</span>
                          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#1A1A1A] bg-[#fcf9ef] px-4 py-2 text-xs font-semibold text-[#30415b] shadow-sm">
                            <BookOpen className="h-4 w-4" />
                            Flashcards
                          </button>
                          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#1A1A1A] bg-[#fcf9ef] px-4 py-2 text-xs font-semibold text-[#30415b] shadow-sm">
                            <Search className="h-4 w-4" />
                            Slides
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#e3dcca] pt-3">
                          <button type="button" className="flex items-center gap-1 rounded-full px-2 py-1 text-[#30415b] hover:bg-[#f4efdf]"><Copy className="h-4 w-4" /></button>
                          <button type="button" className="flex items-center gap-1 rounded-full px-2 py-1 text-[#30415b] hover:bg-[#f4efdf]"><ThumbsUp className="h-4 w-4" /></button>
                          <button type="button" className="flex items-center gap-1 rounded-full px-2 py-1 text-[#30415b] hover:bg-[#f4efdf]"><ThumbsDown className="h-4 w-4" /></button>
                          <button type="button" className="flex items-center gap-1 rounded-full px-2 py-1 text-[#30415b] hover:bg-[#f4efdf]"><Volume2 className="h-4 w-4" /></button>
                          <button type="button" className="flex items-center gap-1 rounded-full px-2 py-1 text-[#30415b] hover:bg-[#f4efdf]"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                      </section>

                      <section className="sticky bottom-0 mt-4 rounded-[24px] border border-[#1A1A1A] bg-[#ffffff] p-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <textarea rows={1} placeholder="Ask any question..." className="min-h-[44px] flex-1 resize-none rounded-2xl border-0 bg-transparent px-3 py-2 text-sm text-[#18212d] outline-none placeholder:text-[#6d7486]" />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 rounded-full border border-[#e1dcca] bg-[#f7f4ea] px-2 py-1">
                            <button type="button" className="rounded-full bg-[#5b3fb5] px-3 py-1 text-[11px] text-white">Fast</button>
                            <button type="button" className="rounded-full px-3 py-1 text-[11px] text-[#30415b]">Quality</button>
                          </div>
                          <button type="button" className="rounded-full border border-[#1A1A1A] bg-[#f8f6ee] p-2 text-[#30415b]"><UploadCloud className="h-4 w-4" /></button>
                          <button type="button" className="rounded-full border border-[#1A1A1A] bg-[#f8f6ee] p-2 text-[#30415b]"><FileText className="h-4 w-4" /></button>
                          <button type="button" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#5b3fb5] text-white shadow-lg">
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="flex min-h-0 flex-1 flex-col bg-[#111722]">
                  <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#101623] px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#b9ddff]" />
                      <span className="text-sm font-semibold text-white">Document Preview</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="rounded-lg p-2 text-[#91a3b9] hover:bg-white/5"><ZoomOut className="h-4 w-4" /></button>
                      <button type="button" className="rounded-lg p-2 text-[#91a3b9] hover:bg-white/5"><ZoomIn className="h-4 w-4" /></button>
                      <button type="button" className="rounded-lg p-2 text-[#91a3b9] hover:bg-white/5"><Download className="h-4 w-4" /></button>
                      <button type="button" className="rounded-lg p-2 text-[#91a3b9] hover:bg-white/5"><Maximize2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto bg-[#ffffff] px-6 py-5">
                    <article className="mx-auto max-w-3xl rounded-[24px] border border-gray-200 bg-white p-7 shadow-xl">
                      <h2 className="mb-5 text-2xl font-bold text-[#162133]">{uploadedFile.name}</h2>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-7 text-[#344054]">
                        {documentText}
                      </div>
                    </article>
                  </div>
                </section>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
}
