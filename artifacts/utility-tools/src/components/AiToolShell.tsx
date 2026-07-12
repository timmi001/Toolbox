import { useState, useRef } from 'react';
import { Sparkles, Copy, Download, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Tool } from '@/lib/tools-data';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getAiToolConfig } from '@/lib/ai-tools-config';
import { ai } from '@/lib/api';

interface AiToolShellProps {
  tool: Tool;
}

export function AiToolShell({ tool }: AiToolShellProps) {
  const config = getAiToolConfig(tool.slug);

  // Initialise select fields to their first option so they are never undefined.
  // Without this, a required select field keeps `inputs[key]` as undefined even
  // though the UI already shows the first option — which permanently disables
  // the generate button.
  const defaultInputs = (): Record<string, string> => {
    const defaults: Record<string, string> = {};
    if (config) {
      for (const field of config.fields) {
        if (field.type === 'select' && field.options?.[0]) {
          defaults[field.key] = field.options[0];
        }
      }
    }
    return defaults;
  };

  const [inputs, setInputs] = useState<Record<string, string>>(defaultInputs);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  if (!config) {
    return (
      <ToolLayout tool={tool}>
        <div className="text-muted-foreground text-center py-8">Tool configuration not found.</div>
      </ToolLayout>
    );
  }

  const setField = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const requiredFields = config.fields.filter(f => f.required);
  const canGenerate = requiredFields.every(f => (inputs[f.key] ?? '').trim().length > 0);

  async function generate() {
    // ---- Performance diagnostics (read-only — does not change behavior) ----
    // Stages measured on the client:
    //   1. prepare  — time from click to the fetch actually being issued
    //      (state updates + building the request payload)
    //   2. request  — wall-clock time for the whole network round trip,
    //      i.e. everything the server-side [perf][ai/generate] logs break
    //      down internally (validate + prompt build + Gemini + serialize)
    //      plus pure network transit time both ways
    //   3. render   — time from receiving the response to the result
    //      actually being painted in the DOM
    // Comparing `request` here against `totalServerMs` in the backend logs
    // for the same request isolates network latency from server processing.
    const requestId = Math.random().toString(36).slice(2, 8);
    const tClickStart = performance.now();
    const tsClickStart = new Date().toISOString();

    setLoading(true);
    setError('');
    setResult('');

    const tPrepareEnd = performance.now();
    console.log(
      `[perf][ai-tool][${requestId}] click→prepared in ${(tPrepareEnd - tClickStart).toFixed(1)}ms ` +
      `(tool=${config!.toolId}, at ${tsClickStart})`,
    );

    try {
      const tRequestStart = performance.now();
      const data = await ai.generate({ toolId: config!.toolId, inputs });
      const tRequestEnd = performance.now();
      const requestMs = tRequestEnd - tRequestStart;
      console.log(
        `[perf][ai-tool][${requestId}] request round-trip: ${requestMs.toFixed(1)}ms ` +
        `(network + server processing + Gemini call — see api-server logs for the server-side breakdown)`,
      );

      const tProcessStart = performance.now();
      setResult(data.result ?? '');
      const tProcessEnd = performance.now();

      // Rendering happens asynchronously after this React state update is
      // committed. Measure the actual paint via requestAnimationFrame so the
      // number reflects when the result is visible on screen, not just when
      // setState was called.
      requestAnimationFrame(() => {
        const tPaint = performance.now();
        const totalMs = tPaint - tClickStart;
        console.log(
          `[perf][ai-tool][${requestId}] response processed in ${(tProcessEnd - tProcessStart).toFixed(1)}ms, ` +
          `rendered/painted after ${(tPaint - tRequestEnd).toFixed(1)}ms ` +
          `— TOTAL click-to-visible: ${totalMs.toFixed(1)}ms`,
        );
      });

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      const tRequestEnd = performance.now();
      console.log(
        `[perf][ai-tool][${requestId}] request FAILED after ${(tRequestEnd - tClickStart).toFixed(1)}ms`,
      );
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
    setInputs(defaultInputs());
    setResult('');
    setError('');
  }

  return (
    <ToolLayout
      tool={tool}
      instructions={`Fill in the fields below and click "${config.buttonLabel ?? 'Generate'}" to get AI-powered results. Results are generated using Google Gemini.`}
    >
      {/* Input Fields */}
      <div className="space-y-5 mb-6">
        {config.fields.map(field => (
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

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={generate}
          disabled={loading || !canGenerate}
          className="flex-1 gap-2 bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {config.buttonLabel ?? 'Generate'}</>
          )}
        </Button>
        {(result || error) && (
          <Button variant="outline" onClick={reset} size="icon" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
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
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto font-mono">
            {result}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Fill in the fields above and click generate to see AI results</p>
        </div>
      )}
    </ToolLayout>
  );
}
