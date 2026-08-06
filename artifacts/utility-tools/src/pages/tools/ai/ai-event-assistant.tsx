import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, ChevronDown, ChevronRight, CircleDollarSign, Copy, Download, Lightbulb, Loader2, ListChecks, Mail, MessageSquare, Mic, PenSquare, Printer, RefreshCw, Save, Search, ShieldAlert, ShoppingBag, Sofa, Sparkles, Trash2, Users, Building2, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import JSZip from 'jszip';
import { useSEO } from '@/hooks/useSEO';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getToolBySlug } from '@/lib/tools-data';
import { ai } from '@/lib/api';

type SectionKey = 'overview' | 'timeline' | 'budget' | 'checklist' | 'shopping' | 'vendors' | 'invitation' | 'description' | 'social' | 'email' | 'speech' | 'hashtags' | 'seating' | 'risk' | 'recommendations';

interface EventFormState {
  eventType: string;
  eventName: string;
  purpose: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  city: string;
  country: string;
  budget: string;
  currency: string;
  guestCount: string;
  theme: string;
  dressCode: string;
  audience: string;
  tone: string;
  specialRequirements: string;
  additionalNotes: string;
}

interface SavedToolkitEntry {
  id: string;
  name: string;
  createdAt: string;
  form: EventFormState;
  sections: Record<SectionKey, string>;
  markdown: string;
}

const SECTION_DEFINITIONS: Array<{ key: SectionKey; title: string; icon: typeof Sparkles; description: string }> = [
  { key: 'overview', title: 'Event Overview', icon: BookOpenCheck, description: 'Summary, theme suggestions, colors, and decorations.' },
  { key: 'timeline', title: 'Event Timeline', icon: CalendarDays, description: 'Detailed schedule from prep to wrap-up.' },
  { key: 'budget', title: 'Budget Planner', icon: CircleDollarSign, description: 'Estimated categories, totals, and remaining budget.' },
  { key: 'checklist', title: 'Event Checklist', icon: ListChecks, description: 'Pre-event, day-before, event-day, and post-event tasks.' },
  { key: 'shopping', title: 'Shopping List', icon: ShoppingBag, description: 'Needed items and quantities for the event.' },
  { key: 'vendors', title: 'Vendor Suggestions', icon: Building2, description: 'Vendor categories and smart selection tips.' },
  { key: 'invitation', title: 'Invitation Generator', icon: Mail, description: 'Formal, casual, WhatsApp, SMS, and email invites.' },
  { key: 'description', title: 'Event Description', icon: MessageSquare, description: 'Website and social descriptions.' },
  { key: 'social', title: 'Social Media Promotion', icon: Sparkles, description: 'Instagram, Facebook, LinkedIn, X, and WhatsApp posts.' },
  { key: 'email', title: 'Email Campaign', icon: Mail, description: 'Save-the-date, invitation, reminder, and thank-you emails.' },
  { key: 'speech', title: 'Speech Generator', icon: Mic, description: 'Welcome, MC, vote of thanks, and closing scripts.' },
  { key: 'hashtags', title: 'Event Hashtags', icon: Hash, description: 'Unique hashtag ideas for promotion.' },
  { key: 'seating', title: 'Seating Planner', icon: Sofa, description: 'Groupings and guest seating suggestions.' },
  { key: 'risk', title: 'Risk & Contingency', icon: ShieldAlert, description: 'Common risks and mitigation ideas.' },
  { key: 'recommendations', title: 'AI Recommendations', icon: Lightbulb, description: 'Budget, attendance, promotion, and sustainability tips.' },
];

const DEFAULT_FORM: EventFormState = {
  eventType: 'Wedding',
  eventName: '',
  purpose: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  venue: '',
  city: '',
  country: '',
  budget: '',
  currency: 'NGN',
  guestCount: '',
  theme: '',
  dressCode: '',
  audience: '',
  tone: 'Professional',
  specialRequirements: '',
  additionalNotes: '',
};

const EMPTY_SECTIONS = Object.fromEntries(SECTION_DEFINITIONS.map(section => [section.key, ''])) as Record<SectionKey, string>;

function buildSectionTitle(section: SectionKey) {
  return SECTION_DEFINITIONS.find(item => item.key === section)?.title ?? section;
}

function parseToolkitMarkdown(markdown: string): Record<SectionKey, string> {
  const sections = { ...EMPTY_SECTIONS };
  const lines = markdown.split(/\r?\n/);
  let currentSection: SectionKey | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      const title = headingMatch[1].trim().toLowerCase();
      currentSection = SECTION_DEFINITIONS.find(section => title.includes(section.title.toLowerCase().replace(/[^a-z0-9]+/g, '')))?.key ?? null;
      continue;
    }

    if (currentSection) {
      sections[currentSection] += `${line}\n`;
    }
  }

  return sections;
}

function buildToolkitMarkdown(sections: Record<SectionKey, string>): string {
  return SECTION_DEFINITIONS.map(section => {
    const body = sections[section.key]?.trim();
    return body ? `## ${section.title}\n\n${body}` : '';
  }).filter(Boolean).join('\n\n');
}

function getSafeStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export default function AiEventAssistant() {
  const tool = getToolBySlug('ai-event-assistant')!;
  useSEO('AI Event Toolkit | ToolboxX', 'Plan weddings, birthdays, conferences, launches, and more with one complete AI event-planning toolkit.');

  const [form, setForm] = useState<EventFormState>(DEFAULT_FORM);
  const [sections, setSections] = useState<Record<SectionKey, string>>(EMPTY_SECTIONS);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<SavedToolkitEntry[]>([]);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    overview: true,
    timeline: true,
    budget: true,
    checklist: true,
    shopping: true,
    vendors: true,
    invitation: true,
    description: true,
    social: true,
    email: true,
    speech: true,
    hashtags: true,
    seating: true,
    risk: true,
    recommendations: true,
  });
  const [copiedSection, setCopiedSection] = useState<SectionKey | null>(null);

  useEffect(() => {
    const storage = getSafeStorage();
    if (!storage) return;

    const raw = storage.getItem('toolboxx-event-toolkits');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SavedToolkitEntry[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // Ignore malformed storage data.
    }
  }, []);

  useEffect(() => {
    const storage = getSafeStorage();
    if (!storage) return;
    storage.setItem('toolboxx-event-toolkits', JSON.stringify(history));
  }, [history]);

  const visibleSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return SECTION_DEFINITIONS;
    return SECTION_DEFINITIONS.filter(section => {
      const content = sections[section.key]?.toLowerCase() ?? '';
      return section.title.toLowerCase().includes(term) || content.includes(term);
    });
  }, [search, sections]);

  function updateField(key: keyof EventFormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(DEFAULT_FORM);
    setSections(EMPTY_SECTIONS);
    setMarkdown('');
    setError('');
  }

  async function generateToolkit(sectionToRegenerate?: SectionKey) {
    setLoading(true);
    setError('');

    try {
      const inputs: Record<string, string> = {
        event_type: form.eventType,
        event_name: form.eventName,
        event_purpose: form.purpose,
        event_date: form.eventDate,
        start_time: form.startTime,
        end_time: form.endTime,
        venue: form.venue,
        city: form.city,
        country: form.country,
        budget: form.budget,
        currency: form.currency,
        guest_count: form.guestCount,
        theme: form.theme,
        dress_code: form.dressCode,
        audience: form.audience,
        tone: form.tone,
        special_requirements: form.specialRequirements,
        additional_notes: form.additionalNotes,
      };

      if (sectionToRegenerate) {
        inputs.section_focus = buildSectionTitle(sectionToRegenerate);
      }

      const data = await ai.generate({ toolId: 'ai-event-assistant', inputs });
      const result = data.result ?? '';

      if (!result.trim()) {
        throw new Error('The assistant did not return any content. Please try again.');
      }

      if (sectionToRegenerate) {
        setSections(prev => ({ ...prev, [sectionToRegenerate]: result.trim() }));
        setMarkdown(buildToolkitMarkdown({ ...sections, [sectionToRegenerate]: result.trim() }));
      } else {
        const nextSections = parseToolkitMarkdown(result.trim());
        setSections(nextSections);
        setMarkdown(result.trim());
        const entryName = form.eventName.trim() || `${form.eventType} event toolkit`;
        const entry: SavedToolkitEntry = {
          id: `${Date.now()}`,
          name: entryName,
          createdAt: new Date().toISOString(),
          form: { ...form },
          sections: nextSections,
          markdown: result.trim(),
        };
        setHistory(prev => [entry, ...prev].slice(0, 8));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Copy this content', text);
    }
  }

  async function copySection(section: SectionKey) {
    await copyText(sections[section]);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1600);
  }

  async function copyAll() {
    await copyText(markdown || buildToolkitMarkdown(sections));
  }

  function toggleSection(section: SectionKey) {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function saveCurrentToolkit() {
    const entryName = form.eventName.trim() || `${form.eventType} event toolkit`;
    const entry: SavedToolkitEntry = {
      id: `${Date.now()}`,
      name: entryName,
      createdAt: new Date().toISOString(),
      form: { ...form },
      sections: { ...sections },
      markdown: markdown || buildToolkitMarkdown(sections),
    };
    setHistory(prev => [entry, ...prev].slice(0, 8));
  }

  function loadToolkit(entry: SavedToolkitEntry) {
    setForm(entry.form);
    setSections(entry.sections);
    setMarkdown(entry.markdown);
  }

  function duplicateToolkit(entry: SavedToolkitEntry) {
    const duplicate: SavedToolkitEntry = {
      ...entry,
      id: `${Date.now()}`,
      name: `${entry.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setHistory(prev => [duplicate, ...prev].slice(0, 8));
  }

  function renameToolkit(entry: SavedToolkitEntry) {
    const nextName = window.prompt('Rename saved toolkit', entry.name);
    if (!nextName) return;
    setHistory(prev => prev.map(item => item.id === entry.id ? { ...item, name: nextName } : item));
  }

  function deleteToolkit(id: string) {
    setHistory(prev => prev.filter(item => item.id !== id));
  }

  function exportDocx() {
    const content = markdown || buildToolkitMarkdown(sections);
    const zip = new JSZip();
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n  <w:body>\n    <w:p><w:r><w:t>${content.replace(/[<>]/g, '')}</w:t></w:r></w:p>\n  </w:body>\n</w:document>`;
    zip.file('word/document.xml', xml);
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'event-toolkit.docx';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  function printToolkit() {
    window.print();
  }

  return (
    <ToolLayout tool={tool} instructions="Fill in event details once and generate a complete toolkit with overview, timeline, budget, checklist, invitations, social posts, speeches, and more.">
      <div className="space-y-6">
        <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-[#0891B2]/10 via-background to-[#7C3AED]/10 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#0891B2]">
            <Sparkles className="h-4 w-4" />
            All-in-one AI Event Toolkit
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Plan every part of your event from one form.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Enter your event setup once, generate a complete toolkit, then regenerate any section independently without rebuilding the whole plan.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Event setup</h3>
                  <p className="text-sm text-muted-foreground">Collect your event details once and let AI build the full package.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Reset
                  </Button>
                  <Button onClick={() => generateToolkit()} className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loading ? 'Generating toolkit...' : 'Generate Event Toolkit'}
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event type</label>
                  <select value={form.eventType} onChange={(e) => updateField('eventType', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {['Wedding','Birthday','Anniversary','Baby Shower','Bridal Shower','Graduation','House Warming','Church Program','Conference','Seminar','Workshop','Business Meeting','Networking Event','Product Launch','Corporate Dinner','Awards Ceremony','Sports Event','Concert','Festival','Webinar','Virtual Event','Charity Event','Funeral','Custom Event'].map(option => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event name</label>
                  <Input value={form.eventName} onChange={(e) => updateField('eventName', e.target.value)} placeholder="e.g. Summer Gala" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event purpose</label>
                  <Textarea value={form.purpose} onChange={(e) => updateField('purpose', e.target.value)} placeholder="What is the event about?" rows={3} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
                  <Input type="date" value={form.eventDate} onChange={(e) => updateField('eventDate', e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Start time</label>
                    <Input type="time" value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">End time</label>
                    <Input type="time" value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Venue</label>
                  <Input value={form.venue} onChange={(e) => updateField('venue', e.target.value)} placeholder="Venue name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                  <Input value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Country</label>
                  <Input value={form.country} onChange={(e) => updateField('country', e.target.value)} placeholder="Country" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Budget</label>
                    <Input value={form.budget} onChange={(e) => updateField('budget', e.target.value)} placeholder="e.g. 5000" />
                  </div>
                  <div className="w-24">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Currency</label>
                    <Input value={form.currency} onChange={(e) => updateField('currency', e.target.value)} placeholder="NGN" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Guests</label>
                  <Input value={form.guestCount} onChange={(e) => updateField('guestCount', e.target.value)} placeholder="e.g. 120" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Theme</label>
                  <Input value={form.theme} onChange={(e) => updateField('theme', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Dress code</label>
                  <Input value={form.dressCode} onChange={(e) => updateField('dressCode', e.target.value)} placeholder="Formal / Casual" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Audience</label>
                  <Input value={form.audience} onChange={(e) => updateField('audience', e.target.value)} placeholder="Friends, family, clients" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Preferred tone</label>
                  <select value={form.tone} onChange={(e) => updateField('tone', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {['Formal','Friendly','Inspirational','Humorous','Professional','Elegant'].map(option => (<option key={option} value={option}>{option}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Special requirements</label>
                  <Textarea value={form.specialRequirements} onChange={(e) => updateField('specialRequirements', e.target.value)} placeholder="Accessibility, dietary needs, technical setup, etc." rows={3} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Additional notes</label>
                  <Textarea value={form.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)} placeholder="Anything else the planner should know?" rows={3} />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Generated toolkit</h3>
                  <p className="text-sm text-muted-foreground">Search across sections and regenerate any one of them independently.</p>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search generated content" className="pl-9" />
                </div>
              </div>

              {error && <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              {loading && !markdown ? (
                <div className="mt-5 space-y-3">
                  {[...Array(4)].map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted/70" />)}
                </div>
              ) : null}

              {!loading && !markdown && !error ? (
                <div className="mt-5 rounded-[20px] border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                  Your generated event toolkit will appear here with sections for planning, promotion, invitations, speeches, and more.
                </div>
              ) : null}

              {markdown && (
                <div className="mt-5 space-y-3">
                  {visibleSections.map(section => {
                    const Icon = section.icon;
                    const isOpen = openSections[section.key];
                    const content = sections[section.key]?.trim();
                    const matchesSearch = !search || content.toLowerCase().includes(search.toLowerCase()) || section.title.toLowerCase().includes(search.toLowerCase());
                    if (!matchesSearch) return null;

                    return (
                      <div key={section.key} className="rounded-[20px] border border-border/60 bg-background/70">
                        <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => toggleSection(section.key)}>
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <Icon className="h-4 w-4 text-primary" />
                            {section.title}
                          </span>
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{content ? 'Ready' : 'Empty'}</span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-border/60 p-4">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copySection(section.key)}>
                                {copiedSection === section.key ? <Sparkles className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedSection === section.key ? 'Copied' : 'Copy'}
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => generateToolkit(section.key)} disabled={loading}>
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                Regenerate
                              </Button>
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} skipHtml>
                                {content || `Generate this section to populate your ${section.title.toLowerCase()} content.`}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[24px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Toolkit actions</h3>
                  <p className="text-sm text-muted-foreground">Share, export, or keep the current plan handy.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button className="w-full justify-start gap-2" onClick={saveCurrentToolkit}>
                  <Save className="h-4 w-4" /> Save current toolkit
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={copyAll}>
                  <Copy className="h-4 w-4" /> Copy full toolkit
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={printToolkit}>
                  <Printer className="h-4 w-4" /> Print / export PDF
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={exportDocx}>
                  <Download className="h-4 w-4" /> Export DOCX
                </Button>
              </div>
            </section>

            <section className="rounded-[24px] border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Saved toolkits</h3>
                  <p className="text-sm text-muted-foreground">Reopen, duplicate, rename, or remove previous event plans.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">No saved toolkits yet. Generate one and it will appear here.</div>
                ) : history.map(entry => (
                  <div key={entry.id} className="rounded-2xl border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => loadToolkit(entry)} title="Open toolkit">
                          <BookOpenCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicateToolkit(entry)} title="Duplicate toolkit">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => renameToolkit(entry)} title="Rename toolkit">
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteToolkit(entry.id)} title="Delete toolkit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </ToolLayout>
  );
}
