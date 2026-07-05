import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { PDFDocument } from 'pdf-lib';

function formatSize(b: number) { return b < 1024 * 1024 ? (b / 1024).toFixed(2) + ' KB' : (b / (1024 * 1024)).toFixed(2) + ' MB'; }

export default function PdfSizeChecker() {
  const tool = getToolBySlug('pdf-size-checker')!;
  const [info, setInfo] = useState<Record<string, string> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = doc.getPages();
    const { width, height } = pages[0]?.getSize() || { width: 0, height: 0 };
    setInfo({
      'File Name': file.name,
      'File Size': formatSize(file.size),
      'Page Count': String(doc.getPageCount()),
      'First Page Width': `${width.toFixed(0)} pt (${(width / 72 * 25.4).toFixed(0)} mm)`,
      'First Page Height': `${height.toFixed(0)} pt (${(height / 72 * 25.4).toFixed(0)} mm)`,
      'Bytes per Page (avg)': formatSize(file.size / doc.getPageCount()),
    });
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to check its size, page count, and page dimensions.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">📊</div>
        <div className="font-medium">Click to upload PDF</div>
      </div>
      {info && (
        <div className="space-y-2">
          {Object.entries(info).map(([k, v]) => (
            <div key={k} className="flex justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-sm font-mono font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
