import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return atob(str);
  }
}

export default function JwtDecoder() {
  const tool = getToolBySlug('jwt-decoder')!;
  const [token, setToken] = useState('');
  const [result, setResult] = useState<{ header: object; payload: object; signature: string } | null>(null);
  const [error, setError] = useState('');

  function decode() {
    const parts = token.trim().split('.');
    if (parts.length !== 3) { setError('Invalid JWT: must have 3 parts separated by dots'); setResult(null); return; }
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      setResult({ header, payload, signature: parts[2] });
      setError('');
    } catch (e: unknown) {
      setError('Failed to decode: ' + (e as Error).message);
      setResult(null);
    }
  }

  function isExpired(payload: { exp?: number }) {
    if (!payload.exp) return null;
    return Date.now() / 1000 > payload.exp;
  }

  return (
    <ToolLayout tool={tool} instructions="Paste a JWT to decode its header and payload. No verification is performed.">
      <Textarea
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        className="min-h-[100px] font-mono text-sm resize-y mb-4"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <div className="flex gap-2 mb-6">
        <Button onClick={decode} disabled={!token}>Decode</Button>
        <Button variant="outline" onClick={() => { setToken(''); setResult(null); setError(''); }}>Reset</Button>
      </div>
      {error && <div className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</div>}
      {result && (
        <div className="space-y-4">
          {(result.payload as { exp?: number }).exp !== undefined && (
            <div className={`p-3 rounded-lg text-sm font-medium ${isExpired(result.payload as { exp?: number }) ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'}`}>
              {isExpired(result.payload as { exp?: number }) ? 'Token is EXPIRED' : 'Token is VALID (not expired)'}
              {' - Expires: '}{new Date((result.payload as { exp: number }).exp * 1000).toLocaleString()}
            </div>
          )}
          {[
            { label: 'Header', data: result.header, color: 'text-red-400' },
            { label: 'Payload', data: result.payload, color: 'text-purple-400' },
          ].map(({ label, data, color }) => (
            <div key={label}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>{label}</div>
              <pre className="bg-muted/30 border border-border/50 rounded-lg p-4 text-sm font-mono overflow-auto text-foreground">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ))}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-blue-400">Signature</div>
            <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-sm font-mono break-all text-muted-foreground">{result.signature}</div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
