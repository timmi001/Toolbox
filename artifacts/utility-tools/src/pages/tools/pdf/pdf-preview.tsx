import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

export default function PdfPreview() {
  const tool = getToolBySlug('pdf-preview')!;
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true); setPages([]); setCurrent(0);
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;
      const rendered: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, canvas, viewport: vp }).promise;
        rendered.push(canvas.toDataURL());
      }
      setPages(rendered);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF to view all its pages rendered in the browser.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">👁️</div>
        <div className="font-medium">{loading ? 'Rendering PDF...' : 'Click to upload PDF'}</div>
      </div>
      {pages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {current + 1} of {pages.length}</span>
            <Button variant="outline" disabled={current === pages.length - 1} onClick={() => setCurrent(c => c + 1)}>Next</Button>
          </div>
          <img src={pages[current]} className="w-full rounded-xl border border-border/50 shadow-lg" alt={`Page ${current + 1}`} />
          <div className="flex gap-2 flex-wrap mt-4 justify-center max-h-32 overflow-auto">
            {pages.map((p, i) => (
              <img key={i} src={p} onClick={() => setCurrent(i)} className={`h-20 w-auto rounded cursor-pointer border-2 transition-all ${i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`} alt={`Thumb ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
