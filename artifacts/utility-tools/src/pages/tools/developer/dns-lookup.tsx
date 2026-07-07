import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const RECORD_TYPES = ['A','AAAA','CNAME','MX','TXT','NS','SOA','PTR','SRV'];

interface DnsAnswer { name: string; type: number; TTL: number; data: string; }
interface DnsResponse { Status: number; Answer?: DnsAnswer[]; Authority?: DnsAnswer[]; }

const TYPE_MAP: Record<number,string> = {1:'A',2:'NS',5:'CNAME',6:'SOA',12:'PTR',15:'MX',16:'TXT',28:'AAAA',33:'SRV',255:'ANY'};

export default function DnsLookup() {
  const tool = getToolBySlug('dns-lookup')!;
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<DnsAnswer[]>([]);
  const [queried, setQueried] = useState('');

  async function lookup() {
    const d = domain.trim().replace(/^https?:\/\//,'').replace(/\/.*/,'');
    if (!d) return;
    setLoading(true); setError(''); setRecords([]);
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`, {
        headers: { Accept: 'application/dns-json' },
      });
      const data: DnsResponse = await res.json();
      if (data.Status !== 0) throw new Error(`DNS query failed (status ${data.Status})`);
      const answers = data.Answer ?? data.Authority ?? [];
      if (answers.length === 0) throw new Error(`No ${type} records found for ${d}`);
      setRecords(answers);
      setQueried(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout tool={tool} instructions="Enter a domain name and select a record type to query DNS records.">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          className="flex-1"
          placeholder="example.com"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
        />
        <div className="flex gap-1 flex-wrap">
          {RECORD_TYPES.map(t => (
            <Button key={t} size="sm" variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)} className="px-2 h-9">{t}</Button>
          ))}
        </div>
        <Button onClick={lookup} disabled={loading || !domain.trim()} className="shrink-0">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Looking up…</> : 'Lookup'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {records.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">{records.length} record{records.length !== 1 ? 's' : ''} for <strong>{queried}</strong> ({type})</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Name','Type','TTL','Value'].map(h => (
                    <th key={h} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-xs break-all">{r.name}</td>
                    <td className="px-4 py-2"><span className="inline-block bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">{TYPE_MAP[r.type] ?? r.type}</span></td>
                    <td className="px-4 py-2 text-muted-foreground">{r.TTL}s</td>
                    <td className="px-4 py-2 font-mono text-xs break-all">{r.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
