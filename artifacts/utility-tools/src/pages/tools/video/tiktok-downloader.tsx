import { getToolBySlug } from '@/lib/tools-data';
import { VideoDownloaderShell, PlatformConfig } from '@/components/VideoDownloaderShell';

const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

const config: PlatformConfig = {
  platform: 'tiktok',
  color: 'bg-black',
  textColor: 'text-white',
  borderColor: 'border-gray-200 dark:border-gray-800',
  logo: <TikTokLogo />,
  urlPlaceholder: 'https://www.tiktok.com/@user/video/...',
  urlHint: 'Works with TikTok video links. Downloads without watermark when supported by the backend.',
  exampleUrl: 'https://www.tiktok.com/@user/video/1234567890123456789',
};

export default function TiktokDownloader() {
  const tool = getToolBySlug('tiktok-downloader')!;
  return <VideoDownloaderShell tool={tool} config={config} />;
}
