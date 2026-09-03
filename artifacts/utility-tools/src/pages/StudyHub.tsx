import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Menu,
  Mic,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
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
import { pdf } from "@/lib/api";
import { generateHubResponse } from "@/lib/hub-ai";

type StudyMaterial = {
  id: string;
  name: string;
  type: string;
  text: string;
  status: "ready" | "processing";
};
type TutorMessage = {
  id: string;
  role: "student" | "tutor";
  text: string;
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
  subjects: "toolbuxx-study-subjects",
  materials: "toolbuxx-study-materials",
  notes: "toolbuxx-study-notes",
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

function TutorXChat({
  subject,
  activeMaterial,
  messages,
  prompt,
  mode,
  status,
  error,
  onPromptChange,
  onModeChange,
  onSubmit,
  onAttach,
  onVoice,
  onClearError,
}: {
  subject: string;
  activeMaterial: StudyMaterial | null;
  messages: TutorMessage[];
  prompt: string;
  mode: string;
  status: "idle" | "submitting" | "generating" | "completed" | "error";
  error: string;
  onPromptChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onSubmit: () => void;
  onAttach: () => void;
  onVoice: () => void;
  onClearError: () => void;
}) {
  const busy = status === "submitting" || status === "generating";
  const quickActions = ["Explain", "Summarize", "Quiz Me", "Study Plan"];

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#08090D] text-white">
      <header className="flex h-16 shrink-0 items-center border-b border-[#24232D] px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2F6DF6]/40 bg-[#112C5D] text-[#A8C7FF]">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">Tutor X</p>
            <p className="text-[11px] text-[#7F7B8E]">Your personal study tutor</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center">
          {messages.length === 0 ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#2F6DF6]/40 bg-[#112C5D] text-[#A8C7FF] shadow-[0_0_36px_rgba(47,109,246,0.16)]">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-5xl">
                What would you like to learn?
              </h1>
              <p className="mt-3 text-sm text-[#8B8798] sm:text-base">
                How can I help with Tutor X?
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#686576]">
                Ask a question, share your notes, or choose a study mode to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-5 pb-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "student" ? "bg-[#2F6DF6] text-white" : "border border-[#2A2934] bg-[#12121A] text-[#D7D3E1]"}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {busy && <div className="text-xs text-[#A8C7FF]">Tutor X is thinking...</div>}
            </div>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-[#24232D] bg-[#08090D] px-4 pb-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {quickActions.map((action, index) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  onModeChange(action);
                  onPromptChange(`${action}: `);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${mode === action || (index === 0 && !mode) ? "border-[#2F6DF6] bg-[#2F6DF6] text-white" : "border-[#302D3A] bg-[#15141B] text-[#AAA5B7] hover:border-[#2F6DF6] hover:text-white"}`}
              >
                {action}
              </button>
            ))}
          </div>
          {error && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-200">
              <span>{error}</span>
              <button type="button" onClick={onClearError} className="font-semibold text-white underline">Dismiss</button>
            </div>
          )}
          {activeMaterial && <div className="mb-2 truncate text-xs text-[#A8C7FF]">Using {activeMaterial.name}</div>}
          <div className="flex items-center gap-2 rounded-full border border-[#35313F] bg-[#17161D] px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.28)] focus-within:border-[#2F6DF6]">
            <button type="button" onClick={onAttach} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9D98AA] transition hover:bg-[#172C50] hover:text-white" aria-label="Attach study material">
              <Paperclip className="h-4 w-4" />
            </button>
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
              placeholder="Ask Tutor X"
              className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-[#716D7B]"
            />
            <button type="button" onClick={onVoice} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9D98AA] transition hover:bg-[#172C50] hover:text-white" aria-label="Voice input">
              <Mic className="h-4 w-4" />
            </button>
            <button type="button" onClick={onSubmit} disabled={!prompt.trim() || busy} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2F6DF6] text-white transition hover:bg-[#5C8DFF] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#5F5B68]">Tutor X can make mistakes. Check important study answers.</p>
        </div>
      </footer>
    </section>
  );
}

export default function StudyHub() {
  const [section, setSection] = useState<StudySection>("tutor");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const activeMaterial = materials.find((item) => item.id === activeMaterialId) ?? null;
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "generating" | "completed" | "error">("idle");
  const [notes, setNotes] = useState<StudyNote[]>(() =>
    read(STORAGE.notes, []),
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<string[]>([]);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("Explain");
  const [inputRef] = useState(() => ({
    current: null as HTMLInputElement | null,
  }));

  const selectSection = (next: StudySection) => {
    setSection(next);
    setDrawerOpen(false);
  };

  const submitTutorPrompt = async () => {
    const value = prompt.trim();
    if (!value || status === "submitting" || status === "generating") return;
    setStatus("submitting");
    setError("");
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "student", text: value },
    ]);
    setPrompt("");
    try {
      setStatus("generating");
      const context = activeMaterial
        ? `Use this study material as context: ${activeMaterial.name}\n${activeMaterial.text.slice(0, 16000)}`
        : "No study material is selected.";
      const answer = await generateHubResponse("study", {
        prompt: `${context}\n\nStudent request: ${value}`,
        mode,
        subject,
        level: "Intermediate",
      });
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "tutor", text: answer },
      ]);
      setStatus("completed");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to reach Tutor X.");
    }
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
        <TutorXChat
          subject={subject}
          activeMaterial={activeMaterial}
          messages={messages}
          prompt={prompt}
          mode={mode}
          status={status}
          error={error}
          onPromptChange={setPrompt}
          onModeChange={setMode}
          onSubmit={() => void submitTutorPrompt()}
          onAttach={() => inputRef.current?.click()}
          onVoice={() => setError("Voice input is not available in this browser.")}
          onClearError={() => setError("")}
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
              setError("The Tutor X chat has been removed from Study Hub.");
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
            <Stat label="Study materials" value={String(materials.length)} />
            <Stat label="Notes created" value={String(notes.length)} />
            <Stat label="Subjects" value={String(subjects.length)} />
          </div>
          {section === "planner" && (
            <button
              type="button"
              onClick={() => setSection("subjects")}
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
    <div className="bg-[#090D12] text-white">
      <input
        ref={(element) => {
          inputRef.current = element;
        }}
        type="file"
        accept=".pdf,.txt,.md,.csv"
        className="hidden"
        onChange={(event) => {
          void uploadMaterial(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
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
            {NAV_MAIN.map(([key, label, Icon]) => navButton(key, label, Icon))}
            <div className="my-4 border-t border-[#1B2936]" />
            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#637387]">
              Progress
            </div>
            {NAV_PROGRESS.map(([key, label, Icon]) =>
              navButton(key, label, Icon),
            )}
            <div className="my-4 border-t border-[#1B2936]" />
          </div>
          <div className="space-y-1 border-t border-[#1B2936] pt-3">
            {navButton("settings", "Settings", Settings2)}
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
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
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
