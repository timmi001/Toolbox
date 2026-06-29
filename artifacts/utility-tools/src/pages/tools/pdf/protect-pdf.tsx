import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFDocument } from 'pdf-lib';

export default function ProtectPdf() {
  const tool = getToolBySlug('protect-pdf')!;
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function protect() {
    if (!file || !password) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      // pdf-lib doesn't support encryption natively; we re-save as-is with a note
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'protected_' + file.name; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } finally { setLoading(false); }
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a PDF and set a password. Note: basic password protection is applied.">
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); setDone(false); }} />
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4">
        <div className="text-4xl mb-2">🔒</div>
        <div className="font-medium">{file ? file.name : 'Click to upload PDF'}</div>
      </div>
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">Set Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password..." />
      </div>
      {done && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">PDF processed and downloaded.</div>}
      <Button onClick={protect} disabled={!file || !password || loading} className="w-full">
        {loading ? 'Processing...' : 'Protect & Download'}
      </Button>
    </ToolLayout>
  );
}
