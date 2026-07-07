import { useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, Globe, Cpu } from 'lucide-react';

interface ParsedUA {
  browser: string; browserVersion: string;
  engine: string; engineVersion: string;
  os: string; osVersion: string;
  device: string; deviceType: string;
}

function parseUA(ua: string): ParsedUA {
  const s = ua.trim();
  // Browser
  let browser = 'Unknown', bv = '';
  if (/Edg\/([^\s]+)/.test(s)) { browser = 'Microsoft Edge'; bv = RegExp.$1; }
  else if (/OPR\/([^\s]+)/.test(s)) { browser = 'Opera'; bv = RegExp.$1; }
  else if (/Chrome\/([^\s]+)/.test(s)) { browser = 'Chrome'; bv = RegExp.$1; }
  else if (/Firefox\/([^\s]+)/.test(s)) { browser = 'Firefox'; bv = RegExp.$1; }
  else if (/Safari\/([^\s]+)/.test(s) && /Version\/([^\s]+)/.test(s)) { browser = 'Safari'; bv = RegExp.$1; }
  else if (/MSIE ([^\s;]+)/.test(s)) { browser = 'Internet Explorer'; bv = RegExp.$1; }
  else if (/Trident\/.*rv:([^\s)]+)/.test(s)) { browser = 'Internet Explorer'; bv = RegExp.$1; }

  // Engine
  let engine = 'Unknown', ev = '';
  if (/AppleWebKit\/([^\s]+)/.test(s)) { engine = 'WebKit'; ev = RegExp.$1; }
  else if (/Gecko\/([^\s]+)/.test(s)) { engine = 'Gecko'; ev = RegExp.$1; }
  else if (/Trident\/([^\s;)]+)/.test(s)) { engine = 'Trident'; ev = RegExp.$1; }

  // OS
  let os = 'Unknown', ov = '';
  if (/Windows NT ([^\s;)]+)/.test(s)) {
    os = 'Windows';
    const ntMap: Record<string, string> = {'10.0':'10/11','6.3':'8.1','6.2':'8','6.1':'7','6.0':'Vista','5.1':'XP'};
    ov = ntMap[RegExp.$1] ?? RegExp.$1;
  } else if (/Mac OS X ([^\s;)]+)/.test(s)) { os = 'macOS'; ov = RegExp.$1.replace(/_/g, '.'); }
  else if (/Android ([^\s;)]+)/.test(s)) { os = 'Android'; ov = RegExp.$1; }
  else if (/(iPhone OS|CPU OS) ([^\s;)]+)/.test(s)) { os = 'iOS'; ov = RegExp.$2.replace(/_/g, '.'); }
  else if (/Linux/.test(s)) os = 'Linux';
  else if (/CrOS/.test(s)) os = 'ChromeOS';

  // Device
  let device = 'Desktop', dtype = 'desktop';
  if (/iPad/.test(s)) { device = 'iPad'; dtype = 'tablet'; }
  else if (/iPhone/.test(s)) { device = 'iPhone'; dtype = 'mobile'; }
  else if (/Android.*Mobile/.test(s)) { device = 'Android Phone'; dtype = 'mobile'; }
  else if (/Android/.test(s)) { device = 'Android Tablet'; dtype = 'tablet'; }
  else if (/Mobile/.test(s)) { device = 'Mobile'; dtype = 'mobile'; }

  return { browser, browserVersion: bv, engine, engineVersion: ev, os, osVersion: ov, device, deviceType: dtype };
}

const DeviceIcon = ({ type }: { type: string }) =>
  type === 'mobile' ? <Smartphone className="h-5 w-5" /> :
  type === 'tablet' ? <Tablet className="h-5 w-5" /> :
  <Monitor className="h-5 w-5" />;

export default function UserAgentParser() {
  const tool = getToolBySlug('user-agent-parser')!;
  const [ua, setUa] = useState(navigator.userAgent);
  const parsed = parseUA(ua);

  const rows = [
    { label: 'Browser', value: parsed.browser, sub: parsed.browserVersion, icon: <Globe className="h-4 w-4" /> },
    { label: 'Engine', value: parsed.engine, sub: parsed.engineVersion, icon: <Cpu className="h-4 w-4" /> },
    { label: 'OS', value: parsed.os, sub: parsed.osVersion, icon: <Monitor className="h-4 w-4" /> },
    { label: 'Device', value: parsed.device, sub: parsed.deviceType, icon: <DeviceIcon type={parsed.deviceType} /> },
  ];

  return (
    <ToolLayout tool={tool} instructions="Your current browser's UA is pre-loaded. Paste any UA string to parse it.">
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">User-Agent String</label>
        <Textarea
          className="font-mono text-xs min-h-[80px] resize-y"
          value={ua}
          onChange={e => setUa(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={() => setUa(navigator.userAgent)}>Reset to My Browser</Button>
        <Button variant="outline" onClick={() => setUa('')}>Clear</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map(({ label, value, sub, icon }) => (
          <div key={label} className="flex items-start gap-3 p-4 rounded-xl border bg-muted/20">
            <span className="mt-0.5 text-primary">{icon}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
              <p className="font-semibold">{value}</p>
              {sub && <p className="text-sm text-muted-foreground">v{sub}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground font-mono break-all">{ua}</p>
      </div>
    </ToolLayout>
  );
}
