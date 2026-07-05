import { useState, useRef } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { getToolBySlug } from '@/lib/tools-data';
import { Button } from '@/components/ui/button';

type FrameType = 'browser' | 'phone' | 'none';

export default function ScreenshotFrame() {
  const tool = getToolBySlug('screenshot-frame')!;
  const [img, setImg] = useState<{ url: string; w: number; h: number; name: string } | null>(null);
  const [frame, setFrame] = useState<FrameType>('browser');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const image = new Image();
      image.onload = () => setImg({ url, w: image.width, h: image.height, name: file.name });
      image.src = url;
    };
    reader.readAsDataURL(file);
  }

  function download() {
    if (!img) return;
    const padding = frame === 'browser' ? { top: 40, sides: 8, bottom: 8 } : frame === 'phone' ? { top: 60, sides: 20, bottom: 60 } : { top: 0, sides: 0, bottom: 0 };
    const cw = img.w + padding.sides * 2;
    const ch = img.h + padding.top + padding.bottom;
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d')!;

    if (frame === 'browser') {
      ctx.fillStyle = '#2d2d2d';
      ctx.roundRect(0, 0, cw, ch, 10);
      ctx.fill();
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(0, 0, cw, padding.top);
      [14, 28, 42].forEach((x, i) => {
        ctx.beginPath();
        ctx.arc(x, 20, 6, 0, Math.PI * 2);
        ctx.fillStyle = ['#ff5f56', '#ffbd2e', '#27c93f'][i];
        ctx.fill();
      });
    } else if (frame === 'phone') {
      ctx.fillStyle = '#1a1a1a';
      ctx.roundRect(0, 0, cw, ch, 30);
      ctx.fill();
    }

    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, padding.sides, padding.top);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'framed_' + img.name; a.click();
    };
    image.src = img.url;
  }

  return (
    <ToolLayout tool={tool} instructions="Upload a screenshot, choose a device frame, then download.">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className="flex gap-2 mb-4">
        {(['browser', 'phone', 'none'] as FrameType[]).map(f => (
          <Button key={f} variant={frame === f ? 'default' : 'outline'} onClick={() => setFrame(f)} className="capitalize flex-1">{f}</Button>
        ))}
      </div>
      {!img ? (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-2">🖥️</div>
          <div className="font-medium">Click to upload screenshot</div>
        </div>
      ) : (
        <div>
          <div className={`inline-block mx-auto block mb-4 ${frame === 'browser' ? 'rounded-xl overflow-hidden border-8 border-[#2d2d2d]' : frame === 'phone' ? 'rounded-3xl overflow-hidden border-8 border-[#1a1a1a]' : ''}`}>
            {frame === 'browser' && <div className="bg-[#2d2d2d] h-8 flex items-center gap-1 px-3"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>}
            <img src={img.url} className="max-w-full max-h-40 object-contain" alt="Screenshot" />
            {frame === 'phone' && <div className="bg-[#1a1a1a] h-10 flex items-center justify-center"><div className="w-16 h-1 rounded-full bg-gray-600"/></div>}
          </div>
          <div className="flex gap-2">
            <Button onClick={download}>Download with Frame</Button>
            <Button variant="outline" onClick={() => setImg(null)}>New Image</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
