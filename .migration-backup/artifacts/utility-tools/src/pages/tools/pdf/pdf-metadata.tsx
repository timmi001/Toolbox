import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { PDFDocument } from 'pdf-lib';

export default function PdfMetadata() {
  const tool = getToolBySlug('pdf-metadata')!;
  const [meta, setMeta] = useState<Record<string, string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setMeta({
      'Title': doc.getTitle() || '(not set)',
      'Author': doc.getAuthor() || '(not set)',
      'Subject': doc.getSubject() || '(not set)',
      'Keywords': doc.getKeywords() || '(not set)',
      'Creator': doc.getCreator() || '(not set)',
      'Producer': doc.getProducer() || '(not set)',
      'Creation Date': doc.getCreationDate()?.toLocaleString() || '(not set)',
      'Modification Date': doc.getModificationDate()?.toLocaleString() || '(not set)',
      'Page Count': String(doc.getPageCount()),
      'File Size': `${(file.size / 1024).toFixed(1)} KB`,
    });
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to view its document metadata.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">ℹ️</div>
        <div className="font-medium">Click to upload PDF</div>
      </div>
      {meta && (
        <div className="space-y-2">
          {Object.entries(meta).map(([k, v]) => (
            <div key={k} className="flex justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground w-40 shrink-0">{k}</span>
              <span className="text-sm font-mono text-right">{v}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
