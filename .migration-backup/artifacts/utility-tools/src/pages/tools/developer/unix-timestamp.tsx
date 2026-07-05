import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'];

export default function UnixTimestamp() {
  const tool = getToolBySlug('unix-timestamp')!;
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  const now = Math.floor(Date.now() / 1000);
  const parsedTs = tsInput ? parseInt(tsInput) : now;
  const tsDate = !isNaN(parsedTs) ? new Date(parsedTs * 1000) : null;
  const dateTs = dateInput ? Math.floor(new Date(dateInput).getTime() / 1000) : null;

  return (
    <ToolLayout tool={tool} instructions="Convert Unix timestamps to dates and vice versa.">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-3 text-primary">Timestamp to Date</h3>
          <div className="flex gap-2 mb-4">
            <Input placeholder={String(now)} value={tsInput} onChange={(e) => setTsInput(e.target.value)} className="font-mono" />
            <Button variant="outline" onClick={() => setTsInput(String(now))}>Now</Button>
          </div>
          {tsDate && !isNaN(tsDate.getTime()) && (
            <div className="space-y-2">
              {TIMEZONES.map(tz => (
                <div key={tz} className="flex justify-between text-sm p-2 bg-muted/20 rounded border border-border/30">
                  <span className="text-muted-foreground">{tz}</span>
                  <span className="font-mono">{tsDate.toLocaleString('en-US', { timeZone: tz, hour12: false })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-primary">Date to Timestamp</h3>
          <Input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="mb-4" />
          {dateTs && !isNaN(dateTs) && (
            <div className="space-y-2">
              <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Unix Timestamp (seconds)</div>
                <div className="font-mono text-2xl text-primary select-all">{dateTs}</div>
              </div>
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Milliseconds</div>
                <div className="font-mono text-sm select-all">{dateTs * 1000}</div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(String(dateTs))}>Copy Timestamp</Button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
