import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Bookmark,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Image,
  Menu,
  Mic,
  Paperclip,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  StickyNote,
  Target,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { generateHubResponse } from "@/lib/hub-ai";
import { pdf } from "@/lib/api";
import { ChatViewport } from "@/components/ChatViewport";

type StudyMessage = {
  id: string;
  role: "student" | "tutor";
  text: string;
  createdAt: string;
};
type StudySession = {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  materialName?: string;
  messages: StudyMessage[];
};
type StudyMaterial = {
  id: string;
  name: string;
  type: string;
  text: string;
  status: "ready" | "processing";
};
type StudyNote = { id: string; title: string; body: string; updatedAt: string };

type StudySection =
  | "tutor"
  | "subjects"
  | "materials"
  | "notes"
  | "flashcards"
  | "practice"
  | "quizzes"
  | "progress"
  | "planner"
  | "streak"
  | "settings"
  | "profile"
  | "upgrade";

const NAV_MAIN: Array<[StudySection, string, typeof BookOpen]> = [
  ["tutor", "AI Tutor", GraduationCap],
  ["subjects", "Subjects", BookOpen],
  ["materials", "Study Materials", FolderOpen],
  ["notes", "Notes", StickyNote],
  ["flashcards", "Flashcards", Zap],
  ["practice", "Practice", HelpCircle],
  ["quizzes", "Quizzes", Target],
];
const NAV_PROGRESS: Array<[StudySection, string, typeof BookOpen]> = [
  ["progress", "Study Progress", Trophy],
  ["planner", "Study Planner", CalendarDays],
  ["streak", "Study Streak", Flame],
];
const STORAGE = {
  sessions: "toolbuxx-study-sessions",
  subjects: "toolbuxx-study-subjects",
  materials: "toolbuxx-study-materials",
  notes: "toolbuxx-study-notes",
  saved: "toolbuxx-study-saved",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* best effort */
  }
}
function dateLabel(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TutorChat({
  messages,
  prompt,
  mode,
  subject,
  subjects,
  activeMaterial,
  status,
  error,
  onPromptChange,
  onSubmit,
  onModeChange,
  onSubjectChange,
  onClearError,
  onClearMaterial,
  onUploadMaterial,
  onSaveAnswer,
}: {
  messages: StudyMessage[];
  prompt: string;
  mode: string;
  subject: string;
  subjects: string[];
  activeMaterial: StudyMaterial | null;
  status: "idle" | "submitting" | "generating" | "completed" | "error";
  error: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onModeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onClearError: () => void;
  onClearMaterial: () => void;
  onUploadMaterial: (file: File | undefined) => void;
  onSaveAnswer: () => void;
}) {
  const isBusy = status === "submitting" || status === "generating";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const modeOptions = [
    ["Explain", "Build a clear mental model"],
    ["Summarize", "Find the essential ideas"],
    ["Quiz Me", "Practice active recall"],
    ["Flashcards", "Turn notes into prompts"],
    ["Solve", "Work through the method"],
    ["Study Plan", "Map the next steps"],
  ] as const;
  const quickStarts = [
    ["Explain a difficult concept", "Explain this concept simply, then give me one example: "],
    ["Help me prepare for a test", "Help me prepare for a test on "],
    ["Make a study plan", "Make a focused study plan for "],
  ] as const;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [prompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, status]);

  const selectMode = (nextMode: string, nextPrompt?: string) => {
    onModeChange(nextMode);
    if (nextPrompt !== undefined) onPromptChange(nextPrompt);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const copyAnswer = (message: StudyMessage) => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(message.text);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <section className="study-tutor-surface flex min-h-0 flex-1 flex-col overflow-hidden text-[#edf5f2]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#1b2c33] px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#3d7669]/50 bg-[#16332f] text-[#8ee7c8]">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#718c91]">
              Study conversation
            </p>
            <p className="truncate text-sm font-semibold text-[#dcebe6]">
              Focused tutor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              data-testid="button-tutor-model"
              onClick={() => {
                setModelOpen((open) => !open);
                setSubjectOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] text-[#9cb3b2] transition hover:bg-[#15272b] hover:text-[#e7f5ef]"
              aria-expanded={modelOpen}
            >
              <span className="sm:hidden">Tutor</span>
              <span className="hidden sm:inline">ToolboXX Tutor</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {modelOpen && (
              <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-[#294249] bg-[#101c22] p-2 shadow-[0_18px_40px_rgba(0,0,0,.38)]">
                <p className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#718c91]">
                  Tutor profile
                </p>
                <button
                  type="button"
                  data-testid="button-select-tutor-model"
                  onClick={() => setModelOpen(false)}
                  className="w-full rounded-lg bg-[#17342f] px-2 py-2 text-left text-xs text-[#c8f4e4]"
                >
                  <span className="block font-semibold">ToolboXX Tutor</span>
                  <span className="mt-0.5 block text-[11px] text-[#8ca9a5]">
                    Clear explanations with guided practice
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              data-testid="button-tutor-subject"
              onClick={() => {
                setSubjectOpen((open) => !open);
                setModelOpen(false);
              }}
              className="flex max-w-[132px] items-center gap-1.5 rounded-lg border border-[#294249] bg-[#101c22] px-2.5 py-2 text-[11px] text-[#c1d5d0] transition hover:border-[#4b877b] hover:text-white"
              aria-expanded={subjectOpen}
            >
              <span className="truncate">{subject}</span>
              <ChevronDown className="h-3 w-3 shrink-0 text-[#71908d]" />
            </button>
            {subjectOpen && (
              <div className="absolute right-0 top-11 z-20 max-h-64 w-48 overflow-y-auto rounded-xl border border-[#294249] bg-[#101c22] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,.38)]">
                {subjects.map((item) => (
                  <button
                    key={item}
                    type="button"
                    data-testid={`button-select-subject-${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      onSubjectChange(item);
                      setSubjectOpen(false);
                    }}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${item === subject ? "bg-[#17342f] text-[#c8f4e4]" : "text-[#9cb3b2] hover:bg-[#172930] hover:text-white"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="study-tutor-scroll min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-10 sm:py-20">
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#74bbaa]">
                <span className="h-px w-8 bg-[#3c766a]" />
                A quieter way to learn
              </div>
              <h2 className="max-w-lg font-serif text-4xl leading-[1.05] text-[#eff8f3] sm:text-6xl">
                What would you like to understand?
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#8fa6a7] sm:text-base">
                Bring a question, a difficult passage, or a set of notes. Your
                tutor will help you build the answer instead of only handing it
                over.
              </p>
            </div>
            <div className="mt-12 grid max-w-2xl gap-2 sm:grid-cols-3">
              {quickStarts.map(([label, value], index) => (
                <button
                  key={label}
                  type="button"
                  data-testid={`button-quick-start-${index}`}
                  onClick={() => selectMode(index === 1 ? "Quiz Me" : index === 2 ? "Study Plan" : "Explain", value)}
                  className="group min-h-[76px] rounded-xl border border-[#263b40] bg-[#0d181e]/70 px-3.5 py-3 text-left text-xs text-[#b6cdca] transition hover:-translate-y-0.5 hover:border-[#4a8378] hover:bg-[#132923] hover:text-[#e4f8ef]"
                >
                  <span className="mb-3 block h-px w-5 bg-[#5c9d8d] transition-all group-hover:w-9" />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5e777d]">
              Selected subject · {subject}
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-10 sm:py-10">
            <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#60797d]">
              <span className="h-px flex-1 bg-[#1c3036]" />
              <span>{subject} · {messages.length} messages</span>
              <span className="h-px flex-1 bg-[#1c3036]" />
            </div>
            <div className="space-y-8">
              {messages.map((message, index) =>
                message.role === "student" ? (
                  <div
                    key={`${message.role}-${message.id}-${index}`}
                    data-testid={`message-student-${message.id}`}
                    className="study-message-enter flex justify-end"
                  >
                    <div className="max-w-[88%] rounded-[18px] rounded-br-md bg-[#19483f] px-4 py-3.5 text-sm leading-7 text-[#e4f8ef] shadow-[0_8px_24px_rgba(0,0,0,.16)] sm:max-w-[76%] sm:px-5">
                      <MessageText text={message.text} />
                    </div>
                  </div>
                ) : (
                  <article
                    key={`${message.role}-${message.id}-${index}`}
                    data-testid={`message-tutor-${message.id}`}
                    className="study-message-enter flex gap-3 sm:gap-4"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#3b766a]/60 bg-[#14302c] text-[#8ee7c8]">
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#cde5dc]">Tutor</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#607a7b]">
                          {dateLabel(message.createdAt)}
                        </span>
                      </div>
                      <div className="max-w-2xl text-[15px] leading-8 text-[#c6d7d4]">
                        <MessageText text={message.text} />
                      </div>
                      <div className="mt-4 flex items-center gap-1 border-t border-[#1b3035] pt-2">
                        <button
                          type="button"
                          data-testid={`button-copy-answer-${message.id}`}
                          onClick={() => copyAnswer(message)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] text-[#789292] transition hover:bg-[#14262b] hover:text-[#b9d8ce]"
                        >
                          {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                        <button
                          type="button"
                          data-testid={`button-save-answer-${message.id}`}
                          onClick={onSaveAnswer}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] text-[#789292] transition hover:bg-[#14262b] hover:text-[#b9d8ce]"
                        >
                          <Bookmark className="h-3 w-3" /> Save answer
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
              {isBusy && (
                <div data-testid="status-tutor-typing" className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#3b766a]/60 bg-[#14302c] text-[#8ee7c8]">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8fb6aa]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#65d4b2]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#65d4b2] [animation-delay:140ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#65d4b2] [animation-delay:280ms]" />
                    <span className="ml-1">Tutor is thinking</span>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      <div className="study-composer-shadow sticky bottom-0 z-10 shrink-0 bg-[#0a1016]/95 px-3 pb-3 pt-2 backdrop-blur-md sm:px-8 sm:pb-5">
        <div className="mx-auto w-full max-w-3xl">
          {error && (
            <div data-testid="status-tutor-error" className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-[#7b4547] bg-[#331d25] px-3 py-2 text-xs text-[#f2c8c9]">
              <span>{error}</span>
              <button
                type="button"
                data-testid="button-dismiss-tutor-error"
                onClick={onClearError}
                aria-label="Dismiss error"
                className="rounded p-1 text-[#e8a8ac] hover:bg-[#51282e] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {activeMaterial && (
            <div data-testid="attachment-preview" className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-[#355a55] bg-[#122722] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#20463e] text-[#8ee7c8]">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#d3eee3]">{activeMaterial.name}</p>
                  <p className="text-[10px] text-[#83aa9e]">
                    {activeMaterial.status === "processing" ? "Processing material" : "Attached as study context"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="button-remove-attachment"
                onClick={onClearMaterial}
                aria-label="Remove attached material"
                className="rounded-md p-1 text-[#8cacaa] hover:bg-[#1d3b36] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {messages.length > 0 && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[
                ["Simplify", "Simplify the last explanation: "],
                ["Test me", "Test me on this topic: "],
                ["Give an example", "Give me one concrete example of this: "],
              ].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  data-testid={`button-follow-up-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => selectMode(label === "Test me" ? "Quiz Me" : "Explain", value)}
                  className="shrink-0 rounded-full border border-[#274046] bg-[#101d22] px-3 py-1.5 text-[10px] text-[#9eb9b3] transition hover:border-[#4d887b] hover:bg-[#153029] hover:text-[#d3eee3]"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
            {modeOptions.map(([item, description]) => (
              <button
                key={item}
                type="button"
                data-testid={`button-mode-${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => selectMode(item, `${item}: `)}
                title={description}
                className={`shrink-0 rounded-md px-2 py-1 text-[10px] transition ${mode === item ? "bg-[#17342f] text-[#b8eedb]" : "text-[#6f888b] hover:bg-[#14272b] hover:text-[#bdd6d0]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="rounded-[17px] border border-[#35545a] bg-[#101a20] transition focus-within:border-[#589b8b] focus-within:shadow-[0_0_0_3px_rgba(78,150,132,.10)]">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              rows={1}
              disabled={isBusy}
              data-testid="input-tutor-prompt"
              placeholder={activeMaterial ? `Ask about ${activeMaterial.name}` : "Ask anything about your studies..."}
              className="max-h-[180px] min-h-[52px] w-full resize-none overflow-y-auto bg-transparent px-4 pb-1 pt-3.5 text-sm leading-7 text-[#e8f2ef] outline-none placeholder:text-[#71898d] disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-2 border-t border-[#24383d] px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  data-testid="input-tutor-material"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadMaterial(file);
                    event.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  data-testid="button-attach-material"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-[#8ea9a5] transition hover:bg-[#172b30] hover:text-[#d8eee6]"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Attach notes</span>
                </button>
                <button
                  type="button"
                  data-testid="button-describe-image"
                  onClick={() => onPromptChange(`${prompt}${prompt ? "\n" : ""}Describe the image I should understand: `)}
                  className="rounded-lg p-1.5 text-[#71898d] transition hover:bg-[#172b30] hover:text-[#d8eee6]"
                  aria-label="Describe an image"
                >
                  <Image className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  data-testid="button-voice-input"
                  onClick={() => setModelOpen(false)}
                  className="rounded-lg p-1.5 text-[#71898d] transition hover:bg-[#172b30] hover:text-[#d8eee6]"
                  aria-label="Voice input unavailable"
                  title="Voice input is not available"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <span className="hidden pl-2 font-mono text-[9px] text-[#587177] sm:inline">Shift + Enter for a new line</span>
              </div>
              <button
                type="button"
                data-testid="button-submit-tutor"
                onClick={onSubmit}
                disabled={!prompt.trim() || isBusy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#71d7b5] text-[#082019] transition hover:bg-[#9ae9cd] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={isBusy ? "Tutor is generating" : "Send question"}
              >
                {isBusy ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#082019]/30 border-t-[#082019]" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="pt-2 text-center text-[10px] text-[#5d757b]">
            Tutor responses are a starting point. Check important details against your course material.
          </p>
        </div>
      </div>
    </section>
  );
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            data-testid={`link-message-${index}`}
            className="break-all text-[#8ee7c8] underline decoration-[#4a8879] underline-offset-2 hover:text-[#c6f5e4]"
          >
            {part}
          </a>
        ) : (
          <span key={`${index}-${part.slice(0, 8)}`} className="whitespace-pre-wrap">
            {part}
          </span>
        ),
      )}
    </>
  );
}

export default function StudyHub() {
  const [section, setSection] = useState<StudySection>("tutor");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(
    () => localStorage.getItem("toolbuxx_study_subject") ?? "General",
  );
  const [subjects, setSubjects] = useState<string[]>(() =>
    read(STORAGE.subjects, [
      "General",
      "Biology",
      "Mathematics",
      "Computer Science",
    ]),
  );
  const [materials, setMaterials] = useState<StudyMaterial[]>(() =>
    read(STORAGE.materials, []),
  );
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(() =>
    localStorage.getItem("toolbuxx_study_material"),
  );
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    read(STORAGE.sessions, []),
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudyMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("Explain");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "generating" | "completed" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<StudyNote[]>(() =>
    read(STORAGE.notes, []),
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [saved, setSaved] = useState<string[]>(() => read(STORAGE.saved, []));
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<string[]>([]);
  const [streak, setStreak] = useState(() =>
    Number(localStorage.getItem("toolbuxx_study_streak") ?? 0),
  );
  const activeMaterial =
    materials.find((item) => item.id === activeMaterialId) ?? null;

  const selectSection = (next: StudySection) => {
    setSection(next);
    setDrawerOpen(false);
    setHistoryOpen(false);
    setSavedOpen(false);
  };
  const persistSession = (nextMessages: StudyMessage[]) => {
    if (!nextMessages.length) return;
    const id = sessionId ?? crypto.randomUUID();
    const next: StudySession = {
      id,
      title:
        nextMessages
          .find((item) => item.role === "student")
          ?.text.slice(0, 48) || "Study session",
      subject,
      updatedAt: new Date().toISOString(),
      materialName: activeMaterial?.name,
      messages: nextMessages,
    };
    const nextSessions = [next, ...sessions.filter((item) => item.id !== id)];
    setSessionId(id);
    setSessions(nextSessions);
    write(STORAGE.sessions, nextSessions);
  };

  const submit = async (requestedPrompt = prompt) => {
    const value = requestedPrompt.trim();
    if (!value || status === "submitting" || status === "generating") return;
    if (activeMaterial?.status === "processing") {
      setError("Processing material…");
      return;
    }
    const userMessage: StudyMessage = {
      id: crypto.randomUUID(),
      role: "student",
      text: value,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setStatus("submitting");
    try {
      setStatus("generating");
      const context = activeMaterial
        ? `Use the selected study material as context. Material: ${activeMaterial.name}\n${activeMaterial.text.slice(0, 16000)}`
        : "No study material is selected.";
      const answer = await generateHubResponse("study", {
        prompt: `${context}\n\nStudent request: ${value}`,
        mode,
        subject,
        level: "Intermediate",
      });
      const completed = [
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "tutor" as const,
          text: answer,
          createdAt: new Date().toISOString(),
        },
      ];
      setMessages(completed);
      persistSession(completed);
      setStatus("completed");
      setStreak((current) => {
        const next = current + 1;
        localStorage.setItem("toolbuxx_study_streak", String(next));
        return next;
      });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Unable to reach the AI tutor.",
      );
    }
  };

  const newSession = () => {
    setSessionId(null);
    setMessages([]);
    setPrompt("");
    setError("");
    setStatus("idle");
    setSection("tutor");
    setDrawerOpen(false);
  };
  const openSession = (session: StudySession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setSubject(session.subject);
    localStorage.setItem("toolbuxx_study_subject", session.subject);
    if (session.materialName)
      setActiveMaterialId(
        materials.find((item) => item.name === session.materialName)?.id ??
          null,
      );
    setSection("tutor");
    setHistoryOpen(false);
    setDrawerOpen(false);
  };
  const deleteSession = (id: string) => {
    const next = sessions.filter((item) => item.id !== id);
    setSessions(next);
    write(STORAGE.sessions, next);
    if (sessionId === id) newSession();
  };
  const renameSession = (session: StudySession) => {
    const title = window.prompt("Rename study session", session.title)?.trim();
    if (!title) return;
    const next = sessions.map((item) =>
      item.id === session.id ? { ...item, title } : item,
    );
    setSessions(next);
    write(STORAGE.sessions, next);
  };

  const uploadMaterial = async (file: File | undefined) => {
    if (!file) return;
    const id = crypto.randomUUID();
    setMaterials((current) => [
      {
        id,
        name: file.name,
        type: file.type || "file",
        text: "",
        status: "processing",
      },
      ...current,
    ]);
    setActiveMaterialId(id);
    setError("");
    try {
      const text =
        file.type === "application/pdf" || file.name.endsWith(".pdf")
          ? (await pdf.extract(file)).document.pageTexts.join("\n\n")
          : await file.text();
      const material = {
        id,
        name: file.name,
        type: file.type || "file",
        text,
        status: "ready" as const,
      };
      setMaterials((current) => {
        const next = current.map((item) => (item.id === id ? material : item));
        write(STORAGE.materials, next);
        return next;
      });
      localStorage.setItem("toolbuxx_study_material", id);
    } catch (err) {
      setMaterials((current) => current.filter((item) => item.id !== id));
      setActiveMaterialId(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process study material.",
      );
    }
  };

  const addSubject = () => {
    const value = window.prompt("Add subject")?.trim();
    if (!value || subjects.includes(value)) return;
    const next = [...subjects, value];
    setSubjects(next);
    write(STORAGE.subjects, next);
    setSubject(value);
  };
  const renameSubject = () => {
    const value = window.prompt("Rename subject", subject)?.trim();
    if (!value || value === subject) return;
    const next = subjects.map((item) => (item === subject ? value : item));
    setSubjects(next);
    setSubject(value);
    write(STORAGE.subjects, next);
  };
  const removeSubject = () => {
    if (subject === "General") return;
    const next = subjects.filter((item) => item !== subject);
    setSubjects(next);
    setSubject("General");
    write(STORAGE.subjects, next);
  };
  const saveAnswer = () => {
    const answer = messages
      .filter((item) => item.role === "tutor")
      .at(-1)?.text;
    if (!answer || saved.includes(answer)) return;
    const next = [answer, ...saved];
    setSaved(next);
    write(STORAGE.saved, next);
  };
  const changeSubject = (nextSubject: string) => {
    setSubject(nextSubject);
    localStorage.setItem("toolbuxx_study_subject", nextSubject);
  };
  const clearActiveMaterial = () => {
    setActiveMaterialId(null);
    localStorage.removeItem("toolbuxx_study_material");
  };
  const filteredSessions = useMemo(
    () =>
      sessions.filter((item) =>
        `${item.title} ${item.subject} ${item.materialName ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [sessions, query],
  );

  const navButton = (
    key: StudySection,
    label: string,
    Icon: typeof BookOpen,
  ) => (
    <button
      key={key}
      type="button"
      onClick={() => selectSection(key)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${section === key ? "bg-[#112C5D] text-white" : "text-[#b4c0ce] hover:bg-[#111a20] hover:text-white"}`}
    >
      <Icon className={`h-4 w-4 ${section === key ? "text-[#7FA8FF]" : ""}`} />
      <span>{label}</span>
    </button>
  );

  const renderSection = () => {
    if (section === "tutor")
      return (
        <TutorChat
          messages={messages}
          prompt={prompt}
          mode={mode}
          subject={subject}
          subjects={subjects}
          activeMaterial={activeMaterial}
          status={status}
          error={error}
          onPromptChange={setPrompt}
          onSubmit={() => void submit()}
          onModeChange={setMode}
          onSubjectChange={changeSubject}
          onClearError={() => setError("")}
          onClearMaterial={clearActiveMaterial}
          onUploadMaterial={uploadMaterial}
          onSaveAnswer={saveAnswer}
        />
      );

    if (section === "subjects")
      return (
        <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
          <SectionTitle
            icon={BookOpen}
            title="Subjects"
            subtitle="Choose the context for your study sessions."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {subjects.map((item) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${item === subject ? "border-[#5BE4B6]/60 bg-[#123B35]" : "border-[#1A1A1A] bg-[#0E151D]"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSubject(item);
                    localStorage.setItem("toolbuxx_study_subject", item);
                    setSection("tutor");
                  }}
                >
                  {item}
                </button>
                {item !== "General" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubject(item);
                      renameSubject();
                    }}
                    aria-label={`Rename ${item}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center gap-2 rounded-xl border border-dashed border-[#5BE4B6]/50 px-3 py-2 text-sm text-[#A9F2D8]"
            >
              <Plus className="h-4 w-4" /> Add subject
            </button>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={renameSubject}
              className="rounded-lg border border-[#1A1A1A] px-3 py-2 text-xs"
            >
              Rename current
            </button>
            <button
              type="button"
              onClick={removeSubject}
              className="rounded-lg border border-red-900/60 px-3 py-2 text-xs text-red-200"
            >
              Remove current
            </button>
          </div>
        </section>
      );
    if (section === "materials")
      return (
        <Materials
          materials={materials}
          activeId={activeMaterialId}
          onSelect={(id) => {
            setActiveMaterialId(id);
            localStorage.setItem("toolbuxx_study_material", id);
            setSection("tutor");
          }}
          onUpload={uploadMaterial}
          onDelete={(id) => {
            const next = materials.filter((item) => item.id !== id);
            setMaterials(next);
            write(STORAGE.materials, next);
            if (activeMaterialId === id) setActiveMaterialId(null);
          }}
        />
      );
    if (section === "notes")
      return (
        <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
          <SectionTitle
            icon={StickyNote}
            title="Notes"
            subtitle="Capture and revisit your study notes."
          />
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Write a note…"
            rows={5}
            className="mt-6 w-full rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-3 text-sm text-white outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!noteDraft.trim()) return;
              const next = [
                {
                  id: crypto.randomUUID(),
                  title: `${subject} note`,
                  body: noteDraft.trim(),
                  updatedAt: new Date().toISOString(),
                },
                ...notes,
              ];
              setNotes(next);
              write(STORAGE.notes, next);
              setNoteDraft("");
            }}
            className="mt-2 rounded-xl bg-[#5BE4B6] px-4 py-2 text-sm font-semibold text-[#061410]"
          >
            Save note
          </button>
          <div className="mt-6 space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-4"
              >
                <div className="flex justify-between gap-2">
                  <h3 className="font-semibold">{note.title}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const next = notes.filter((item) => item.id !== note.id);
                      setNotes(next);
                      write(STORAGE.notes, next);
                    }}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4 text-red-300" />
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#C5D0DB]">
                  {note.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      );
    if (section === "flashcards")
      return (
        <section className="mx-auto w-full max-w-2xl p-5 text-center sm:p-8">
          <SectionTitle
            icon={Zap}
            title="Flashcards"
            subtitle="Generate a focused set from your selected material."
          />
          <button
            type="button"
            onClick={async () => {
              setStatus("submitting");
              try {
                const text = await generateHubResponse("study", {
                  prompt: `Create 5 concise flashcards from ${activeMaterial?.name ?? subject}. Format one question and answer per line.`,
                  mode: "Flashcards",
                  subject,
                  level: "Intermediate",
                  context: activeMaterial?.text.slice(0, 12000),
                });
                setFlashcards(text.split("\n").filter(Boolean).slice(0, 5));
                setStatus("completed");
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Unable to generate flashcards.",
                );
                setStatus("error");
              }
            }}
            className="mt-6 rounded-xl bg-[#5BE4B6] px-4 py-2 text-sm font-semibold text-[#061410]"
          >
            Generate flashcards
          </button>
          {flashcards.length > 0 && (
            <div className="mt-8">
              <div className="min-h-40 rounded-2xl border border-[#1A1A1A] bg-[#0E151D] p-8 text-lg">
                {flashcards[flashcardIndex]}
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFlashcardIndex((current) => Math.max(0, current - 1))
                  }
                  className="rounded-lg border px-3 py-2 text-xs"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-xs text-[#718194]">
                  {flashcardIndex + 1} / {flashcards.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFlashcardIndex((current) =>
                      Math.min(flashcards.length - 1, current + 1),
                    )
                  }
                  className="rounded-lg border px-3 py-2 text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      );
    if (section === "practice" || section === "quizzes")
      return (
        <section className="mx-auto w-full max-w-2xl p-5 sm:p-8">
          <SectionTitle
            icon={section === "practice" ? HelpCircle : Target}
            title={section === "practice" ? "Practice" : "Quizzes"}
            subtitle="Generate questions for the current subject and material."
          />
          <button
            type="button"
            onClick={() => {
              setSection("tutor");
              setMode(section === "quizzes" ? "Quiz Me" : "Practice");
              setPrompt(
                `${section === "quizzes" ? "Generate a quiz" : "Give me practice questions"} for ${subject}: `,
              );
            }}
            className="mt-6 rounded-xl bg-[#5BE4B6] px-4 py-2 text-sm font-semibold text-[#061410]"
          >
            Start {section === "quizzes" ? "quiz" : "practice"}
          </button>
        </section>
      );
    if (section === "progress" || section === "planner" || section === "streak")
      return (
        <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
          <SectionTitle
            icon={
              section === "streak"
                ? Flame
                : section === "planner"
                  ? CalendarDays
                  : Trophy
            }
            title={
              section === "progress"
                ? "Study Progress"
                : section === "planner"
                  ? "Study Planner"
                  : "Study Streak"
            }
            subtitle="Your study activity stays available in this workspace."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Sessions" value={String(sessions.length)} />
            <Stat
              label="Questions answered"
              value={String(
                messages.filter((item) => item.role === "student").length,
              )}
            />
            <Stat label="Current streak" value={`${streak} days`} />
          </div>
          {section === "planner" && (
            <button
              type="button"
              onClick={() => setPrompt("Plan my next study session for ")}
              className="mt-6 rounded-xl border border-[#5BE4B6]/50 px-4 py-2 text-sm text-[#A9F2D8]"
            >
              Plan next session with AI
            </button>
          )}
        </section>
      );
    return (
      <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
        <SectionTitle
          icon={
            section === "profile"
              ? UserRound
              : section === "upgrade"
                ? Sparkles
                : Settings2
          }
          title={section[0].toUpperCase() + section.slice(1)}
          subtitle="This workspace setting is available for the current account."
        />
        <div className="mt-6 rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-5 text-sm text-[#C5D0DB]">
          Changes are saved locally for this study workspace.
        </div>
      </section>
    );
  };

  return (
    <ChatViewport className="bg-[#090D12] text-white">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,280px)] flex-col border-r border-[#1B2936] bg-[#090D12] p-3 transition-transform md:relative md:z-0 md:w-[250px] md:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-[#1B2936] px-2 pb-4">
            <Link
              href="/"
              aria-label="Back to dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1A1A1A]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="md:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 flex-1 overflow-y-auto">
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">
              Main
            </div>
            <button
              type="button"
              onClick={newSession}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#b4c0ce] hover:bg-[#111a20]"
            >
              <Plus className="h-4 w-4" /> New Study Session
            </button>
            {NAV_MAIN.map(([key, label, Icon]) => navButton(key, label, Icon))}
            <div className="my-4 border-t border-[#1B2936]" />
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">
              Progress
            </div>
            {NAV_PROGRESS.map(([key, label, Icon]) =>
              navButton(key, label, Icon),
            )}
            <div className="my-4 border-t border-[#1B2936]" />
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#b4c0ce] hover:bg-[#111a20]"
            >
              <Clock3 className="h-4 w-4" /> History
            </button>
            <button
              type="button"
              onClick={() => setSavedOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#b4c0ce] hover:bg-[#111a20]"
            >
              <Sparkles className="h-4 w-4" /> Saved
            </button>
          </div>
          <div className="space-y-1 border-t border-[#1B2936] pt-3">
            {navButton("settings", "Settings", Settings2)}
            {navButton("profile", "Profile", UserRound)}
            {navButton("upgrade", "Upgrade", Zap)}
          </div>
        </aside>
        <div
          className={`fixed inset-0 z-40 bg-black/70 md:hidden ${drawerOpen ? "block" : "hidden"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1B2936] px-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#637387]">
                  Study Hub
                </div>
                <div className="text-sm font-semibold">
                  {section === "tutor"
                    ? subject
                    : section[0].toUpperCase() + section.slice(1)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="rounded-lg p-2 text-[#91A0B0] hover:bg-[#111a20]"
                aria-label="Open history"
              >
                <Clock3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSavedOpen(true)}
                className="rounded-lg p-2 text-[#91A0B0] hover:bg-[#111a20]"
                aria-label="Open saved"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">
            {renderSection()}
          </div>
        </main>
      </div>
      {(historyOpen || savedOpen) && (
        <OverlayPanel
          title={historyOpen ? "Study history" : "Saved answers"}
          onClose={() => {
            setHistoryOpen(false);
            setSavedOpen(false);
          }}
        >
          {historyOpen ? (
            <>
              <button
                type="button"
                onClick={newSession}
                className="mb-3 flex items-center gap-2 rounded-xl border border-[#5BE4B6]/50 px-3 py-2 text-sm text-[#A9F2D8]"
              >
                <Plus className="h-4 w-4" /> New session
              </button>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sessions"
                className="mb-3 w-full rounded-xl border border-[#1A1A1A] bg-[#0E151D] px-3 py-2 text-sm outline-none"
              />
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-3"
                  >
                    <button
                      type="button"
                      onClick={() => openSession(session)}
                      className="w-full text-left"
                    >
                      <div className="truncate text-sm font-semibold">
                        {session.title}
                      </div>
                      <div className="mt-1 text-xs text-[#718194]">
                        {session.subject}
                        {session.materialName
                          ? ` · ${session.materialName}`
                          : ""}
                      </div>
                      <div className="mt-1 text-[11px] text-[#718194]">
                        {dateLabel(session.updatedAt)}
                      </div>
                    </button>
                    <div className="mt-2 flex gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => renameSession(session)}
                        className="text-[#A9F2D8]"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSession(session.id)}
                        className="text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {saved.length ? (
                saved.map((item, index) => (
                  <article
                    key={`${item}-${index}`}
                    className="rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-3 text-sm leading-6"
                  >
                    {item}
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#718194]">
                  No saved answers yet. Save an answer from the tutor view.
                </p>
              )}
            </div>
          )}
        </OverlayPanel>
      )}
    </ChatViewport>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 h-5 w-5 text-[#5BE4B6]" />
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-[#8492A3]">{subtitle}</p>
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0E151D] p-4">
      <div className="text-2xl font-bold text-[#5BE4B6]">{value}</div>
      <div className="mt-1 text-xs text-[#718194]">{label}</div>
    </div>
  );
}
function Materials({
  materials,
  activeId,
  onSelect,
  onUpload,
  onDelete,
}: {
  materials: StudyMaterial[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onUpload: (file?: File) => void;
  onDelete: (id: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
      <SectionTitle
        icon={FolderOpen}
        title="Study Materials"
        subtitle="Select the files your AI tutor should use as context."
      />
      <input
        ref={input}
        type="file"
        accept=".pdf,.txt,.md,.csv,image/*,.ppt,.pptx,.doc,.docx"
        className="hidden"
        onChange={(event) => {
          onUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#5BE4B6]/50 p-6 text-sm text-[#A9F2D8]"
      >
        <Upload className="h-4 w-4" /> Upload study material
      </button>
      <div className="mt-5 space-y-2">
        {materials.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${item.id === activeId ? "border-[#5BE4B6]/60 bg-[#123B35]" : "border-[#1A1A1A] bg-[#0E151D]"}`}
          >
            <FileText className="h-4 w-4 shrink-0 text-[#5BE4B6]" />
            <button
              type="button"
              onClick={() => item.status === "ready" && onSelect(item.id)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="truncate text-sm">{item.name}</div>
              <div className="mt-1 text-xs text-[#718194]">
                {item.status === "processing"
                  ? "Processing…"
                  : item.id === activeId
                    ? "Using this material"
                    : "Ready"}
              </div>
            </button>
            {item.id === activeId && (
              <Check className="h-4 w-4 text-[#5BE4B6]" />
            )}
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-4 w-4 text-red-300" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
function OverlayPanel({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/70">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0"
      />
      <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,420px)] flex-col border-l border-[#1B2936] bg-[#090D12] p-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1B2936] pb-4">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">{children}</div>
      </aside>
    </div>
  );
}
