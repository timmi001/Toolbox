import { Wrench } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Tool } from '@/lib/tools-data';
import { VideoDownloadRequest } from '@/lib/api';

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

export function VideoDownloaderShell({ tool, config }: VideoDownloaderShellProps) {
  return (
    <ToolLayout tool={tool}>
      <div className="mx-auto w-full max-w-2xl">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center rounded-xl border border-amber-300/60 bg-amber-50/70 px-5 py-10 text-center dark:border-amber-700/60 dark:bg-amber-950/20 sm:px-10 sm:py-14"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 sm:h-20 sm:w-20">
            <Wrench className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
          </div>
          <h2 className="max-w-lg text-xl font-bold leading-tight text-foreground sm:text-2xl">
            Video Downloaders Temporarily Unavailable — Under Maintenance
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            We’re making improvements to this downloader. Downloads are disabled while maintenance is in progress. Please check back soon.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-background/70 px-4 py-2 text-xs font-medium text-amber-800 dark:border-amber-700/70 dark:text-amber-200 sm:text-sm">
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            {tool.name} is currently offline
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
