import { useState } from 'react';
import { Link2, Download, AlertCircle, Loader2, CheckCircle2, FileVideo, Clock } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tool } from '@/lib/tools-data';
import { videoDownload, VideoDownloadResponse, VideoFormat, VideoDownloadRequest } from '@/lib/api';

export interface PlatformConfig {
  platform: VideoDownloadRequest['platform'];
  color: string;          // Tailwind bg class for accent strip
  textColor: string;      // Tailwind text class
  borderColor: string;    // Tailwind border class
  logo: React.ReactNode;
  urlPlaceholder: string;
  urlHint: string;
  exampleUrl: string;
}

interface VideoDownloaderShellProps {
  tool: Tool;
  config: PlatformConfig;
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(s?: number) {
  if (!s) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function VideoDownloaderShell({ tool, config }: VideoDownloaderShellProps) {
  const [url, setUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoDownloadResponse | null>(null);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await videoDownload.fetch({ url: trimmed, platform: config.platform });
      setSourceUrl(trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleFetch();
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // clipboard access denied — user can paste manually
    }
  }

  async function downloadFile(format: VideoFormat) {
    if (!result || !sourceUrl) return;

    const downloadUrl = videoDownload.buildStreamUrl({
      sourceUrl,
      platform: config.platform,
      format,
      title: result.title,
    });

    try {
      const response = await fetch(downloadUrl, {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Download failed with status ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.error) message = parsed.error;
        } catch {
          // Ignore JSON parse errors and fall back to the default message.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${result.title}.${format.ext}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download the file.');
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Platform header strip */}
        <div className={`rounded-xl border-2 ${config.borderColor} overflow-hidden`}>
          <div className={`${config.color} px-5 py-3 flex items-center gap-3`}>
            <span className="flex-shrink-0">{config.logo}</span>
            <span className={`font-semibold text-sm ${config.textColor}`}>
              Paste a {tool.name.replace(' Downloader', '')} video link below to download
            </span>
          </div>

          {/* URL input */}
          <div className="p-4 space-y-3 bg-white dark:bg-gray-950">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 pr-3"
                  placeholder={config.urlPlaceholder}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handlePaste} className="shrink-0">
                Paste
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{config.urlHint}</p>
            <Button
              className="w-full"
              onClick={handleFetch}
              disabled={loading || !url.trim()}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching video info…</>
                : <><Download className="mr-2 h-4 w-4" /> Get Download Links</>}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Thumbnail + meta */}
            <div className="flex gap-4 p-4 border-b">
              {result.thumbnail ? (
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-32 h-20 object-cover rounded-lg shrink-0 bg-muted"
                />
              ) : (
                <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileVideo className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm leading-snug line-clamp-2">{result.title}</p>
                {result.duration && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(result.duration)}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {result.formats.length} format{result.formats.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>

            {/* Format list */}
            <div className="divide-y">
              {result.formats.map((fmt, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
                      {fmt.ext}
                    </span>
                    <span className="text-sm font-medium">{fmt.quality}</span>
                    {fmt.filesize && (
                      <span className="text-xs text-muted-foreground">{formatSize(fmt.filesize)}</span>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(fmt)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to use */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
          <p className="font-medium">How to use</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Copy the video URL from {tool.name.replace(' Downloader', '')}</li>
            <li>Paste it in the box above and click <strong>Get Download Links</strong></li>
            <li>Choose your preferred quality and click <strong>Download</strong></li>
          </ol>
          <p className="text-xs text-muted-foreground pt-1">
            Example: <code className="bg-muted rounded px-1 py-0.5 text-[11px]">{config.exampleUrl}</code>
          </p>
        </div>

      </div>
    </ToolLayout>
  );
}
