import { useState } from 'react';
import { getToolBySlug } from '@/lib/tools-data';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ai } from '@/lib/api';
import {
  Mic, ChevronRight, RotateCcw, CheckCircle2,
  Loader2, AlertCircle, Trophy, Target,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type Phase = 'setup' | 'starting' | 'asking' | 'evaluating' | 'reaction' | 'done';

interface QA {
  question: string;
  answer: string;
  feedback: string;
  score: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseQuestions(raw: string): string[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => /^\d+[\.\)]\s+/.test(l))
    .map(l => l.replace(/^\d+[\.\)]\s+/, '').trim())
    .filter(Boolean);
}

function parseScore(feedback: string): { text: string; score: number | null } {
  const match = feedback.match(/Score:\s*(\d+)\s*\/\s*10/i);
  const score = match ? parseInt(match[1], 10) : null;
  const text = feedback.replace(/Score:\s*\d+\s*\/\s*10/i, '').trim();
  return { text, score };
}

function scoreColor(s: number | null) {
  if (s === null) return 'text-muted-foreground';
  if (s >= 8) return 'text-emerald-500';
  if (s >= 6) return 'text-yellow-500';
  return 'text-red-500';
}

function scoreBg(s: number | null) {
  if (s === null) return 'bg-muted';
  if (s >= 8) return 'bg-emerald-500/10 border-emerald-500/30';
  if (s >= 6) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Question {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function AiInterviewPractice() {
  const tool = getToolBySlug('ai-interview-practice')!;

  // Setup fields
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Mid');
  const [type, setType] = useState('Mixed');
  const [count, setCount] = useState('8');

  // Session state
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<QA[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<{ text: string; score: number | null } | null>(null);
  const [error, setError] = useState('');

  const totalQ = questions.length || parseInt(count, 10);

  // ── Start interview ──────────────────────────────────────────────────────
  async function startInterview() {
    if (!role.trim()) return;
    setError('');
    setPhase('starting');
    try {
      const res = await ai.generate({
        toolId: 'ai-interview-start',
        inputs: { role: role.trim(), level, type, count },
      });
      const qs = parseQuestions(res.result);
      if (qs.length === 0) throw new Error('Could not generate questions. Please try again.');
      setQuestions(qs);
      setCurrentIndex(0);
      setHistory([]);
      setAnswer('');
      setPhase('asking');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setPhase('setup');
    }
  }

  // ── Submit answer ────────────────────────────────────────────────────────
  async function submitAnswer() {
    if (!answer.trim()) return;
    setError('');
    setPhase('evaluating');
    const question = questions[currentIndex];
    try {
      const res = await ai.generate({
        toolId: 'ai-interview-respond',
        inputs: { role, question, answer: answer.trim() },
      });
      const { text, score } = parseScore(res.result);
      const qa: QA = { question, answer: answer.trim(), feedback: text, score };
      setHistory(prev => [...prev, qa]);
      setCurrentFeedback({ text, score });
      setPhase('reaction');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setPhase('asking');
    }
  }

  // ── Advance to next question or finish ───────────────────────────────────
  function advance() {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      setPhase('done');
    } else {
      setCurrentIndex(next);
      setAnswer('');
      setCurrentFeedback(null);
      setPhase('asking');
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  function reset() {
    setPhase('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setHistory([]);
    setCurrentFeedback(null);
    setError('');
  }

  // ─── Average score ───────────────────────────────────────────────────────
  const scores = history.map(h => h.score).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

  return (
    <ToolLayout tool={tool}>
      {/* ── SETUP ────────────────────────────────────────────────────────── */}
      {phase === 'setup' && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Set up your interview</h2>
                <p className="text-sm text-muted-foreground">The AI will interview you live — one question at a time.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Job Role / Position <span className="text-red-500">*</span></label>
                <Input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Product Manager, Data Scientist"
                  onKeyDown={e => e.key === 'Enter' && startInterview()}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Level</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {['Entry', 'Mid', 'Senior', 'Lead / Principal'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Question Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {['Mixed', 'Behavioral', 'Technical'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Questions</label>
                  <select
                    value={count}
                    onChange={e => setCount(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {['5', '8', '10', '15'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!role.trim()}
              onClick={startInterview}
            >
              Start Interview
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Answer each question as if it's a real interview. The AI will react to every answer and give you a score at the end.
          </p>
        </div>
      )}

      {/* ── STARTING ─────────────────────────────────────────────────────── */}
      {phase === 'starting' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm font-medium">Preparing your interview…</p>
        </div>
      )}

      {/* ── ASKING ───────────────────────────────────────────────────────── */}
      {(phase === 'asking' || phase === 'evaluating') && (
        <div className="space-y-5">
          <ProgressBar current={currentIndex + 1} total={totalQ} />

          {/* Question card */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-500">Q{currentIndex + 1}</span>
              </div>
              <p className="text-base font-medium leading-relaxed">{questions[currentIndex]}</p>
            </div>

            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here — speak naturally, as you would in a real interview…"
              rows={7}
              disabled={phase === 'evaluating'}
              className="resize-none text-sm"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={reset} disabled={phase === 'evaluating'}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Restart
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!answer.trim() || phase === 'evaluating'}
              onClick={submitAnswer}
            >
              {phase === 'evaluating' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Evaluating…</>
              ) : (
                <>Submit Answer <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── REACTION ─────────────────────────────────────────────────────── */}
      {phase === 'reaction' && currentFeedback && (
        <div className="space-y-5">
          <ProgressBar current={currentIndex + 1} total={totalQ} />

          {/* Question recap */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-purple-500">Q{currentIndex + 1}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{questions[currentIndex]}</p>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm text-foreground/80 italic">
              "{history[history.length - 1]?.answer}"
            </div>
          </div>

          {/* Interviewer reaction */}
          <div className={`rounded-2xl border p-5 space-y-3 ${scoreBg(currentFeedback.score)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold">Interviewer's reaction</span>
              </div>
              {currentFeedback.score !== null && (
                <span className={`text-lg font-bold ${scoreColor(currentFeedback.score)}`}>
                  {currentFeedback.score}/10
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{currentFeedback.text}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Restart
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={advance}
            >
              {currentIndex + 1 >= questions.length ? (
                <><Trophy className="w-4 h-4 mr-2" />See Results</>
              ) : (
                <>Next Question <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── DONE ─────────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="space-y-6">
          {/* Summary header */}
          <div className="rounded-2xl border bg-card p-6 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold">Interview Complete</h2>
            <p className="text-muted-foreground text-sm">{role} · {level} · {type}</p>
            {avgScore && (
              <div className="mt-3">
                <span className={`text-4xl font-bold ${scoreColor(parseFloat(avgScore))}`}>{avgScore}</span>
                <span className="text-muted-foreground text-lg">/10</span>
                <p className="text-xs text-muted-foreground mt-1">Average score across {scores.length} answered question{scores.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>

          {/* All Q&As */}
          <div className="space-y-4">
            {history.map((qa, i) => (
              <div key={i} className="rounded-2xl border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Question {i + 1}</span>
                  </div>
                  {qa.score !== null && (
                    <span className={`text-sm font-bold ${scoreColor(qa.score)}`}>{qa.score}/10</span>
                  )}
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm font-medium">{qa.question}</p>
                  <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm text-foreground/80 italic">
                    "{qa.answer}"
                  </div>
                  <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${scoreBg(qa.score)}`}>
                    {qa.feedback}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start a New Interview
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
