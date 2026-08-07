import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Download, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { Tool } from '@/lib/tools-data';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { study } from '@/lib/api';
import { useHistory } from '@/hooks/useHistory';

type StudyAction = 'notes' | 'quiz' | 'flashcards' | 'planner' | 'homework' | 'tutor';

interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
}

function getFieldDefinitions(toolSlug: string): FieldDefinition[] {
  switch (toolSlug) {
    case 'ai-study-notes':
      return [
        { key: 'topic', label: 'Topic', type: 'text', placeholder: 'Photosynthesis, calculus, sociology...', required: true },
        { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
        { key: 'format', label: 'Format', type: 'select', options: ['Detailed Notes', 'Concise Summary', 'Revision Sheet'] },
      ];
    case 'ai-quiz-generator':
      return [
        { key: 'topic', label: 'Topic', type: 'text', placeholder: 'World history, chemistry, coding...', required: true },
        { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Mixed', 'Hard'] },
        { key: 'count', label: 'Number of questions', type: 'text', placeholder: '10' },
      ];
    case 'ai-flashcard-generator':
      return [
        { key: 'topic', label: 'Topic', type: 'text', placeholder: 'Vocabulary, formulas, biology terms...', required: true },
        { key: 'count', label: 'How many cards?', type: 'text', placeholder: '15' },
      ];
    case 'ai-study-planner':
      return [
        { key: 'topic', label: 'Topic or subject', type: 'text', placeholder: 'Exam prep for biology', required: true },
        { key: 'days', label: 'Days', type: 'text', placeholder: '7' },
        { key: 'subject', label: 'Focus area', type: 'text', placeholder: 'Biology' },
      ];
    case 'ai-homework-helper':
      return [
        { key: 'topic', label: 'Assignment or topic', type: 'text', placeholder: 'Solve this algebra problem', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Mathematics' },
      ];
    case 'ai-math-solver':
    case 'ai-interview-practice':
    case 'ai-interview-questions':
      return [
        { key: 'question', label: 'Question or problem', type: 'textarea', placeholder: 'Ask your study question or paste the problem here...', required: true, rows: 6 },
        { key: 'topic', label: 'Topic (optional)', type: 'text', placeholder: 'Algebra, interview prep...' },
      ];
    default:
      return [
        { key: 'topic', label: 'Topic', type: 'text', placeholder: 'What would you like to study?', required: true },
      ];
  }
}

function getAction(toolSlug: string): StudyAction {
  switch (toolSlug) {
    case 'ai-study-notes':
      return 'notes';
    case 'ai-quiz-generator':
      return 'quiz';
    case 'ai-flashcard-generator':
      return 'flashcards';
    case 'ai-study-planner':
      return 'planner';
    case 'ai-homework-helper':
      return 'homework';
    case 'ai-math-solver':
    case 'ai-interview-practice':
    case 'ai-interview-questions':
      return 'tutor';
    default:
      return 'notes';
  }
}

interface StudyToolShellProps {
  tool: Tool;
}

export function StudyToolShell({ tool }: StudyToolShellProps) {
  const action = useMemo(() => getAction(tool.slug), [tool.slug]);
  const fields = useMemo(() => getFieldDefinitions(tool.slug), [tool.slug]);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { addEntry } = useHistory();

  const setField = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const requiredFields = fields.filter(f => f.required);
  const canGenerate = requiredFields.every(f => (inputs[f.key] ?? '').trim().length > 0);

  async function generate() {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const data = await study.generate({ action, input: inputs });
      const nextResult = data.result ?? '';
      setResult(nextResult);

      if (nextResult.trim()) {
        addEntry({
          toolSlug: tool.slug,
          toolName: tool.name,
          toolCategory: tool.category,
          prompt: Object.values(inputs).filter(Boolean).join('\n\n').trim() || 'Study generation',
          response: nextResult,
          createdAt: new Date().toISOString(),
          characterCount: nextResult.length,
          favorite: false,
        });
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadResult() {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.slug}-result.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setInputs({});
    setResult('');
    setError('');
  }

  return (
    <ToolLayout
      tool={tool}
      instructions="Fill in the fields below and click generate to start a dedicated study workflow."
    >
      <div className="space-y-5 mb-6">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
              {field.required && <span className="text-primary ml-1">*</span>}
            </label>

            {field.type === 'textarea' && (
              <Textarea
                value={inputs[field.key] ?? ''}
                onChange={e => setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows ?? 5}
                className="resize-y font-mono text-sm"
                disabled={loading}
              />
            )}

            {field.type === 'text' && (
              <Input
                value={inputs[field.key] ?? ''}
                onChange={e => setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={loading}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                value={inputs[field.key] ?? field.options[0]}
                onChange={e => setField(field.key, e.target.value)}
                disabled={loading}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={generate} disabled={loading || !canGenerate} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate</>
          )}
        </Button>
        {(result || error) && (
          <Button variant="outline" onClick={reset} size="icon" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Result
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5 h-8 text-xs">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadResult} className="gap-1.5 h-8 text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground max-h-[600px] overflow-y-auto whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}

      {!result && !error && !loading && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Add your study details and generate a focused result.</p>
        </div>
      )}
    </ToolLayout>
  );
}
