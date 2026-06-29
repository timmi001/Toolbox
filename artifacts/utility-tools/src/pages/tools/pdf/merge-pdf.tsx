import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';

export default function MergePdf() {
  const tool = getToolBySlug('merge-pdf')!;
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList) {
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
    setDone(false);
  }

  function remove(i: number) { setFiles(prev => prev.filter((_, idx) => idx !== i)); }

  async function merge() {
    if (files.length < 2) return;
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'merged.pdf'; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload two or more PDF files. They will be merged in order. Click Merge & Download.">
      <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📄</div>
        <div className="font-medium">Click to add PDF files</div>
        <div className="text-sm text-muted-foreground">Add multiple PDFs — they will be merged in order</div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2 mb-4">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm font-mono truncate flex-1 mr-2">{f.name}</span>
              <span className="text-xs text-muted-foreground mr-3">{(f.size / 1024).toFixed(0)} KB</span>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} className="text-destructive h-7">Remove</Button>
            </div>
          ))}
        </div>
      )}
      {done && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">PDFs merged and downloaded successfully!</div>}
      <div className="flex gap-2">
        <Button onClick={merge} disabled={files.length < 2 || loading} className="flex-1">
          {loading ? 'Merging...' : `Merge ${files.length} PDFs`}
        </Button>
        <Button variant="outline" onClick={() => { setFiles([]); setDone(false); }}>Clear All</Button>
      </div>
    </ToolLayout>
  );
}
