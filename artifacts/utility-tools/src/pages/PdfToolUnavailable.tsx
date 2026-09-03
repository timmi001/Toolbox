import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'wouter';
import { ToolLayout } from '@/components/ToolLayout';
import type { Tool } from '@/lib/tools-data';

export default function PdfToolUnavailable({ tool }: { tool: Tool }) {
  return (
    <ToolLayout tool={tool} instructions="This tool is wired into the PDF Tools catalog, but its processing action is not implemented yet.">
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
        <Construction className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Development preview</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          There is no backend operation for {tool.name} yet. No file will be uploaded, changed, or downloaded from this page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/chat-with-pdf" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Chat with PDF</Link>
          <Link href="/pdf-tools" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Browse PDF Tools</Link>
        </div>
      </div>
    </ToolLayout>
  );
}
