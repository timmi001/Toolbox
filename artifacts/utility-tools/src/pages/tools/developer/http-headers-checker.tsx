import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { httpHeaders as httpHeadersApi } from '@/lib/api';

import type { HttpHeadersResponse as HeadersResponse } from '@/lib/api';

const SECURITY_HEADERS = [
  'strict-transport-security','content-security-policy','x-content-type-options',
  'x-frame-options','referrer-policy','permissions-policy','x-xss-protection',
];

export default function HttpHeadersChecker() {
  const tool = getToolBySlug('http-headers-checker')!;
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<HeadersResponse | null>(null);

  async function check() {
    let u = url.trim();
    if (!u.startsWith('http')) u = 'https://' + u;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await httpHeadersApi.check(u);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  const securityScore = result
    ? SECURITY_HEADERS.filter(h => result.headers[h]).length
    : 0;

  const statusColor = result
    ? result.status < 300 ? 'text-emerald-300' : result.status < 400 ? 'text-amber-300' : 'text-red-300'
    : '';

  return (
    <ToolLayout tool={tool} instructions="Enter a URL to inspect its HTTP response headers and security score.">
      <div className="flex gap-2 mb-6">
        <Input
          className="flex-1"
          placeholder="https://example.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
        />
        <Button onClick={check} disabled={loading || !url.trim()}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking…</> : 'Check'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Status + Security Score */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-muted/20 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">HTTP Status</p>
              <p className={`text-3xl font-extrabold ${statusColor}`}>{result.status}</p>
              <p className="text-sm text-muted-foreground">{result.statusText}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 text-center">
              <p className="text-xs text-muted-foreground uppercase mb-1">Security Headers</p>
              <p className="text-3xl font-extrabold text-primary">{securityScore}/{SECURITY_HEADERS.length}</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {securityScore >= 5
                  ? <><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Good</>
                  : <><ShieldAlert className="h-3.5 w-3.5 text-amber-300" /> Could improve</>}
              </p>
            </div>
          </div>

          {/* Headers table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Response Headers ({Object.keys(result.headers).length})
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {Object.entries(result.headers).sort(([a],[b]) => a.localeCompare(b)).map(([k, v]) => (
                <div key={k} className="flex items-start gap-4 px-4 py-2.5 hover:bg-muted/20">
                  <span className={`text-xs font-mono font-semibold shrink-0 w-56 truncate ${SECURITY_HEADERS.includes(k) ? 'text-green-500' : 'text-primary'}`}>{k}</span>
                  <span className="text-xs font-mono text-muted-foreground break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing security headers */}
          {securityScore < SECURITY_HEADERS.length && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-950/30 p-4">
              <p className="text-sm font-medium text-amber-200 mb-2">Missing security headers:</p>
              <div className="flex flex-wrap gap-2">
                {SECURITY_HEADERS.filter(h => !result.headers[h]).map(h => (
                  <span key={h} className="text-xs font-mono bg-amber-400/15 text-amber-200 rounded px-2 py-0.5">{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
