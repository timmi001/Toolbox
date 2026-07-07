import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';

interface IpInfo {
  ip: string; city: string; region: string; country_name: string; country_code: string;
  org: string; asn: string; timezone: string; currency: string; currency_name: string;
  latitude: number; longitude: number; continent_code: string;
}

export default function IpLookup() {
  const tool = getToolBySlug('ip-lookup')!;
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<IpInfo | null>(null);

  async function lookup(target?: string) {
    const q = (target ?? ip).trim();
    setLoading(true); setError(''); setInfo(null);
    try {
      const res = await fetch(`https://ipapi.co/${q ? q + '/' : ''}json/`);
      const data = await res.json();
      if (data.error) throw new Error(data.reason ?? 'Invalid IP address');
      setInfo(data as IpInfo);
      if (!target) setIp(data.ip);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  const fields = info ? [
    { label: 'IP Address', value: info.ip },
    { label: 'City', value: info.city },
    { label: 'Region', value: info.region },
    { label: 'Country', value: `${info.country_name} (${info.country_code})` },
    { label: 'Continent', value: info.continent_code },
    { label: 'Coordinates', value: `${info.latitude}, ${info.longitude}` },
    { label: 'Timezone', value: info.timezone },
    { label: 'ISP / Org', value: info.org },
    { label: 'ASN', value: info.asn },
    { label: 'Currency', value: `${info.currency_name} (${info.currency})` },
  ] : [];

  return (
    <ToolLayout tool={tool} instructions="Enter an IP address or leave blank to look up your own IP.">
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="8.8.8.8 (leave blank for your IP)"
          value={ip}
          onChange={e => setIp(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
          className="flex-1"
        />
        <Button variant="outline" onClick={() => { setIp(''); lookup(''); }} disabled={loading}>My IP</Button>
        <Button onClick={() => lookup()} disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Looking up…</> : 'Lookup'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {info && (
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 flex items-center gap-2 border-b">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{info.city}, {info.region}, {info.country_name}</span>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
            {[fields.slice(0, 5), fields.slice(5)].map((col, ci) => (
              <div key={ci} className="divide-y">
                {col.map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start px-4 py-2.5 gap-4">
                    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                    <span className="text-sm font-medium text-right break-all">{value || '—'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
