import { useState } from 'react';
import { ArrowRightLeft, ChevronDown, FileStack, ShieldCheck, Wrench, X, Zap } from 'lucide-react';
import { useLocation } from 'wouter';

export type PdfToolMenuItem = {
  label: string;
  path: string;
  available?: boolean;
};

export type PdfToolMenuGroup = {
  label: string;
  icon: typeof FileStack;
  items: PdfToolMenuItem[];
};

export const PDF_TOOL_GROUPS: PdfToolMenuGroup[] = [
  {
    label: 'Organize PDF',
    icon: FileStack,
    items: [
      { label: 'Merge PDF', path: '/pdf/merge', available: true },
      { label: 'Split PDF', path: '/pdf/split', available: true },
      { label: 'Extract Pages', path: '/pdf/extract-pages', available: true },
      { label: 'Delete Pages', path: '/pdf/delete-pages', available: true },
      { label: 'Reorder Pages', path: '/pdf/reorder-pages', available: true },
      { label: 'Rotate PDF', path: '/pdf/rotate', available: true },
    ],
  },
  {
    label: 'Optimize PDF',
    icon: Zap,
    items: [
      { label: 'Compress PDF', path: '/pdf/compress', available: true },
      { label: 'Repair PDF', path: '/pdf/repair' },
      { label: 'Flatten PDF', path: '/pdf/flatten' },
    ],
  },
  {
    label: 'Convert PDF',
    icon: ArrowRightLeft,
    items: [
      { label: 'PDF to Word', path: '/pdf/pdf-to-word' },
      { label: 'PDF to Excel', path: '/pdf/pdf-to-excel' },
      { label: 'PDF to PowerPoint', path: '/pdf/pdf-to-powerpoint' },
      { label: 'PDF to JPG', path: '/pdf/pdf-to-jpg', available: true },
      { label: 'JPG to PDF', path: '/pdf/jpg-to-pdf', available: true },
      { label: 'Word to PDF', path: '/pdf/word-to-pdf' },
      { label: 'Excel to PDF', path: '/pdf/excel-to-pdf' },
      { label: 'PowerPoint to PDF', path: '/pdf/powerpoint-to-pdf' },
    ],
  },
  {
    label: 'Edit & Secure',
    icon: ShieldCheck,
    items: [
      { label: 'Edit PDF', path: '/pdf/edit' },
      { label: 'Add Text', path: '/pdf/add-text' },
      { label: 'Add Image', path: '/pdf/add-image' },
      { label: 'Watermark PDF', path: '/pdf/watermark', available: true },
      { label: 'Add Page Numbers', path: '/pdf/add-page-numbers', available: true },
      { label: 'Sign PDF', path: '/pdf/sign' },
      { label: 'Protect PDF', path: '/pdf/protect', available: true },
      { label: 'Unlock PDF', path: '/pdf/unlock', available: true },
      { label: 'Redact PDF', path: '/pdf/redact' },
    ],
  },
];

export function PdfToolsMenu({ compact = false }: { compact?: boolean }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(value => !value)}
        className={`flex items-center gap-2 rounded-xl border border-[#71345A] bg-[#1D101A] px-3 py-2 text-sm font-medium text-[#FFD1E5] transition hover:border-[#FF66B8] hover:bg-[#3A172F] hover:text-white ${compact ? 'w-full justify-between' : ''}`}
      >
        <Wrench className="h-4 w-4" />
        <span>PDF Tools</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close PDF tools menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div role="menu" className={`absolute z-50 mt-2 max-h-[min(70vh,620px)] w-[min(92vw,640px)] overflow-y-auto rounded-2xl border border-[#252525] bg-[#0b0b0b] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.55)] ${compact ? 'left-0' : 'right-0'}`}>
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#718194]">PDF utilities</div>
              <button type="button" aria-label="Close PDF tools menu" onClick={() => setOpen(false)} className="rounded-lg p-1 text-[#718194] hover:bg-[#171717] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PDF_TOOL_GROUPS.map(({ label, icon: Icon, items }) => (
                <section key={label} className="rounded-xl border border-[#1A1A1A] bg-[#101010] p-2">
                  <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-xs font-semibold text-[#dfeaf8]"><Icon className="h-3.5 w-3.5 text-[#FFB5D9]" />{label}</div>
                  <div className="grid gap-0.5">
                    {items.map(item => (
                      <button
                        key={item.path}
                        type="button"
                        role="menuitem"
                        onClick={() => { setOpen(false); navigate(item.path); }}
                        className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-[#b4c0ce] transition hover:bg-[#3A172F] hover:text-white"
                      >
                        <span>{item.label}</span>
                        {!item.available && <span className="text-[10px] text-[#718194]">Dev preview</span>}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
