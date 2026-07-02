import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, ChevronLeft, ChevronRight, Type, Trash2 } from 'lucide-react';

interface Annotation {
  id: string;
  page: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export default function PdfEditor() {
  const tool = getToolBySlug('pdf-editor')!;
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('document');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [color, setColor] = useState('#000000');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingMode, setAddingMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const renderPage = async (bytes: Uint8Array, pageNum: number) => {
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
    const pdf = await getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try { await task.promise; } catch (_) { /* cancelled */ }
  };

  const loadPdf = async (file: File) => {
    setLoading(true);
    setAnnotations([]);
    setSelectedAnnotation(null);
    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    setPdfBytes(bytes);
    setFileName(file.name.replace('.pdf', ''));
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
    const pdf = await getDocument({ data: bytes.slice() }).promise;
    setTotalPages(pdf.numPages);
    setCurrentPage(1);
    await renderPage(bytes, 1);
    setLoading(false);
  };

  useEffect(() => {
    if (pdfBytes) renderPage(pdfBytes, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!addingMode || !newText.trim()) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = (canvasRef.current!.width) / rect.width;
    const scaleY = (canvasRef.current!.height) / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setAnnotations(prev => [...prev, { id: crypto.randomUUID(), page: currentPage, x, y, text: newText, fontSize, color }]);
    setAddingMode(false);
  };

  const pageAnnotations = annotations.filter(a => a.page === currentPage);

  const saveWithAnnotations = async () => {
    if (!pdfBytes) return;
    setSaving(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const canvas = canvasRef.current!;

      for (const ann of annotations) {
        const page = pdfDoc.getPage(ann.page - 1);
        const { width: pW, height: pH } = page.getSize();
        const scaleX = pW / canvas.width;
        const scaleY = pH / canvas.height;
        const hexColor = ann.color.replace('#', '');
        const r = parseInt(hexColor.slice(0, 2), 16) / 255;
        const g = parseInt(hexColor.slice(2, 4), 16) / 255;
        const b = parseInt(hexColor.slice(4, 6), 16) / 255;
        page.drawText(ann.text, {
          x: ann.x * scaleX,
          y: pH - ann.y * scaleY - ann.fontSize,
          size: ann.fontSize,
          font,
          color: rgb(r, g, b),
        });
      }

      const savedBytes = await pdfDoc.save();
      const blob = new Blob([savedBytes], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}_edited.pdf`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ToolLayout tool={tool} instructions='Upload a PDF, click "Add Text" to enter text mode, then click anywhere on the page to place text. Download the edited PDF when done.'>
      {!pdfBytes ? (
        <div
          className="border-2 border-dashed border-border/60 rounded-xl p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) loadPdf(f); }}
        >
          <Upload className="mx-auto mb-4 text-muted-foreground w-10 h-10" />
          <p className="text-lg font-semibold mb-1">Drop PDF here or click to upload</p>
          <p className="text-sm text-muted-foreground">PDF files only</p>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadPdf(f); }} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/20 rounded-xl border border-border/50">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Text to add</label>
              <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Type text here…" className="bg-background" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Font size</label>
              <input type="number" min={8} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-md border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded-md border border-border cursor-pointer bg-background p-1" />
            </div>
            <Button
              onClick={() => setAddingMode(!addingMode)}
              variant={addingMode ? 'default' : 'outline'}
              disabled={!newText.trim()}
              className="gap-2"
            >
              <Type className="w-4 h-4" />
              {addingMode ? 'Click on page to place…' : 'Add Text'}
            </Button>
          </div>

          {/* Canvas area */}
          <div ref={overlayRef} className="relative rounded-xl border border-border overflow-hidden bg-muted/10" style={{ cursor: addingMode ? 'crosshair' : 'default' }}>
            {loading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 text-sm text-muted-foreground">
                Loading PDF…
              </div>
            )}
            <canvas ref={canvasRef} className="block max-w-full" onClick={handleCanvasClick} />

            {/* Overlay annotations */}
            {pageAnnotations.map(ann => {
              const canvas = canvasRef.current;
              if (!canvas) return null;
              const rect = canvas.getBoundingClientRect();
              const scaleX = rect.width / canvas.width;
              const scaleY = rect.height / canvas.height;
              return (
                <div
                  key={ann.id}
                  className={`absolute select-none px-1 rounded cursor-pointer border ${selectedAnnotation === ann.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-primary/50'}`}
                  style={{
                    left: ann.x * scaleX,
                    top: ann.y * scaleY - ann.fontSize * scaleY,
                    fontSize: ann.fontSize * scaleY,
                    color: ann.color,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnotation(ann.id); }}
                >
                  {ann.text}
                </div>
              );
            })}
          </div>

          {/* Annotation list & page nav */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">Page {currentPage} / {totalPages}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedAnnotation && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => { setAnnotations(prev => prev.filter(a => a.id !== selectedAnnotation)); setSelectedAnnotation(null); }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete selected
                </Button>
              )}
              <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
                <Upload className="w-4 h-4" /> New PDF
              </Button>
              <Button onClick={saveWithAnnotations} disabled={saving} className="gap-2">
                <Download className="w-4 h-4" /> {saving ? 'Saving…' : 'Download Edited PDF'}
              </Button>
            </div>
          </div>

          {annotations.length > 0 && (
            <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''} added across all pages</p>
              <div className="flex flex-wrap gap-2">
                {annotations.map(a => (
                  <span key={a.id}
                    className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${selectedAnnotation === a.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'}`}
                    onClick={() => { setSelectedAnnotation(a.id); setCurrentPage(a.page); }}>
                    p{a.page}: "{a.text.slice(0, 16)}{a.text.length > 16 ? '…' : ''}"
                  </span>
                ))}
              </div>
            </div>
          )}

          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadPdf(f); }} />
        </div>
      )}
    </ToolLayout>
  );
}
