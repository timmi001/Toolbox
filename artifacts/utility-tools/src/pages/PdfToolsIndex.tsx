import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { PDF_TOOL_GROUPS } from '@/components/PdfToolsMenu';

export default function PdfToolsIndex() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ToolboxX</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">PDF Tools</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Practical PDF utilities, alongside Chat with PDF for document questions and analysis.</p>
        </div>
        <Link href="/chat-with-pdf" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Chat with PDF</Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {PDF_TOOL_GROUPS.map(group => (
          <section key={group.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold">{group.label}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {group.items.map(item => (
                <Link key={item.path} href={item.path} className="rounded-lg border border-border/70 px-3 py-2.5 text-sm transition hover:border-primary/60 hover:bg-muted">
                  <span className="block font-medium">{item.label}</span>
                  {!item.available && <span className="mt-1 block text-xs text-muted-foreground">Development preview</span>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
