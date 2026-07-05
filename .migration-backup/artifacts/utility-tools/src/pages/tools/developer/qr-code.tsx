import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

export default function QrCodeGenerator() {
  const tool = getToolBySlug('qr-code')!;
  const [text, setText] = useState('https://example.com');
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    }).catch(() => {});
  }, [text, size]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'qr-code.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  return (
    <ToolLayout tool={tool} instructions="Enter text or a URL to generate a QR code. Click download to save as PNG.">
      <div className="flex gap-2 mb-4">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL..." className="flex-1" />
      </div>
      <div className="flex gap-2 mb-6">
        {[128, 256, 512].map(s => (
          <Button key={s} variant={size === s ? 'default' : 'outline'} onClick={() => setSize(s)} className="flex-1">{s}px</Button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-xl inline-block">
          <canvas ref={canvasRef} />
        </div>
        <div className="flex gap-2">
          <Button onClick={download} disabled={!text}>Download PNG</Button>
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(canvasRef.current?.toDataURL('image/png') || '')}>Copy Data URL</Button>
        </div>
      </div>
    </ToolLayout>
  );
}
