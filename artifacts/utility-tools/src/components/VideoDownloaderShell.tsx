import { useEffect, useState } from 'react';
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
  const [downloading, setDownloading] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'started'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoDownloadResponse | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState('');

  useEffect(() => {
    if (result?.formats[0]) setSelectedFormatId(result.formats[0].formatId);
  }, [result]);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    setDownloadState('idle');
    try {
      console.log(`[frontend][handleFetch] fetching metadata for url=${trimmed} platform=${config.platform}`);
      const data = await videoDownload.fetch({ url: trimmed, platform: config.platform });
      console.log(`[frontend][handleFetch] success: title=${data.title} formats=${data.formats.length}`);
      setSourceUrl(trimmed);
      setResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error(`[frontend][handleFetch] error: ${errorMsg}`);
      setError(errorMsg);
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

  async function downloadFile() {
    const format = result?.formats.find(item => item.formatId === selectedFormatId);
    if (!result || !sourceUrl || !format || downloading) return;
    setDownloading(true);
    setDownloadState('idle');
    setError('');
    try {
      videoDownload.start({
        url: sourceUrl,
        platform: config.platform,
        format,
      });
      setDownloadState('started');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to download the file.';
      console.error(`[frontend][downloadFile] error: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setDownloading(false);
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
          <div className="p-4 space-y-3 bg-card">
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
                : <><Download className="mr-2 h-4 w-4" /> Get Video</>}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-300">
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
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {result.formats.length} format{result.formats.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Video ready
              </p>
              <label className="text-sm font-medium" htmlFor="video-quality">Quality</label>
              <select
                id="video-quality"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedFormatId}
                onChange={e => setSelectedFormatId(e.target.value)}
                disabled={downloading}
              >
                {result.formats.map(fmt => (
                  <option key={fmt.formatId} value={fmt.formatId}>
                    {fmt.quality} · {fmt.ext.toUpperCase()}{fmt.filesize ? ` · ${formatSize(fmt.filesize)}` : ''}
                  </option>
                ))}
              </select>
              <Button className="w-full" onClick={downloadFile} disabled={downloading || !selectedFormatId}>
                {downloading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading…</>
                  : <><Download className="mr-2 h-4 w-4" /> Download</>}
              </Button>
              {downloadState === 'started' && (
                <p className="flex items-center justify-center gap-2 text-sm text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Download started
                </p>
              )}
            </div>
          </div>
        )}

        {/* How to use */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
          <p className="font-medium">How to use</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Copy the video URL from {tool.name.replace(' Downloader', '')}</li>
            <li>Paste it in the box above and click <strong>Get Video</strong></li>
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
