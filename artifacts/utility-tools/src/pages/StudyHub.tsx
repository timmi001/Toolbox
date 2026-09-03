import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
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
  ["tutor", "Tutor X", GraduationCap],
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

function PreviousStudyChat({
  messages,
  prompt,
  mode,
  subject,
  activeMaterial,
  status,
  error,
  onPromptChange,
  onSubmit,
  onModeChange,
  onClearError,
}: {
  messages: StudyMessage[];
  prompt: string;
  mode: string;
  subject: string;
  activeMaterial: StudyMaterial | null;
  status: "idle" | "submitting" | "generating" | "completed" | "error";
  error: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onModeChange: (value: string) => void;
  onClearError: () => void;
}) {
  const isBusy = status === "submitting" || status === "generating";
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#000000]">
      <section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-8">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center py-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#244A8F] bg-[#112C5D] text-[#7FA8FF]">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <p className="mt-5 text-sm leading-6 text-[#8492A3]">
                  Ask anything about a topic, upload your notes, or choose a
                  study mode. I&apos;ll explain concepts clearly and help you
                  test yourself.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "student" ? "bg-[#112C5D] text-[#E7F0FF]" : "border border-[#1E2D3B] bg-[#0E151D] text-[#CBD6E0]"}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isBusy && (
                <div className="flex items-center gap-2 text-xs text-[#A8C7FF]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#2F6DF6]" />
                  Tutor is thinking…
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 z-10 mt-5 shrink-0 border-t border-[#1A1A1A] bg-[#000000] pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-4">
          <div className="flex gap-2 overflow-x-auto border-b border-[#1A1A1A] pb-3 [scrollbar-width:none]">
            {[
              "Explain",
              "Summarize",
              "Quiz Me",
              "Flashcards",
              "Solve",
              "Study Plan",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onModeChange(item);
                  onPromptChange(`${item}: `);
                }}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${mode === item ? "border-[#2F6DF6]/70 bg-[#112C5D] text-[#A8C7FF]" : "border-transparent bg-[#0A0A0A] text-[#8492A3] hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
          {activeMaterial && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#A8C7FF]">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">Using {activeMaterial.name}</span>
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-200">
              <span>{error}</span>
              <button
                type="button"
                onClick={onClearError}
                className="font-semibold text-white underline"
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="mt-3 rounded-[26px] border border-[#1A1A1A] bg-[#0b0f12] p-2 shadow-[0_-10px_24px_rgba(0,0,0,0.25)] focus-within:border-[#2F6DF6]/70">
            <textarea
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              rows={1}
              disabled={isBusy}
              placeholder={
                activeMaterial
                  ? `Ask about ${activeMaterial.name}`
                  : "Ask anything about your studies…"
              }
              className="max-h-28 min-h-[40px] w-full resize-none bg-transparent px-1 py-2 text-[14px] leading-5 text-[#edf4ff] outline-none placeholder:text-[#6c7784] disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-2 border-t border-[#1A1A1A] pt-2">
              <span className="truncate text-[11px] text-[#718194]">
                {activeMaterial ? activeMaterial.name : subject}
              </span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={!prompt.trim() || isBusy}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2F6DF6] text-white shadow-[0_8px_18px_rgba(47,109,246,0.35)] transition hover:bg-[#5C8DFF] disabled:opacity-40"
                aria-label={isBusy ? "Generating response" : "Send message"}
              >
                {isBusy ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ArrowLeft className="h-4 w-4 rotate-180" />}
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default function StudyHub() {
  const [section, setSection] = useState<StudySection>("subjects");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(
    () => {
      const stored = localStorage.getItem("toolbuxx_study_subject");
      return stored && stored !== "General" ? stored : "Biology";
    },
  );
  const [subjects, setSubjects] = useState<string[]>(() =>
    read(STORAGE.subjects, ["Biology", "Mathematics", "Computer Science"]).filter(
      (item) => item !== "General",
    ),
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
  const [inputRef] = useState(() => ({
    current: null as HTMLInputElement | null,
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, status]);

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
    setSection("subjects");
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
    setSection("subjects");
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
    const next = subjects.filter((item) => item !== subject);
    setSubjects(next);
    setSubject(next[0] ?? "Biology");
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
      onClick={() => selectSection(key === "tutor" ? "subjects" : key)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${section === key ? "bg-[#112C5D] text-white" : "text-[#b4c0ce] hover:bg-[#111a20] hover:text-white"}`}
    >
      <Icon className={`h-4 w-4 ${section === key ? "text-[#7FA8FF]" : ""}`} />
      <span>{label}</span>
    </button>
  );

  const renderSection = () => {
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
                    setSection("subjects");
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
            setSection("subjects");
            setSection("subjects");
            setSection("subjects");
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
              setSection("subjects");
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
