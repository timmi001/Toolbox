import { getToolBySlug } from '@/lib/tools-data';
import { VideoDownloaderShell, PlatformConfig } from '@/components/VideoDownloaderShell';

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const config: PlatformConfig = {
  platform: 'twitter',
  color: 'bg-black',
  textColor: 'text-white',
  borderColor: 'border-gray-200 dark:border-gray-800',
  logo: <XLogo />,
  urlPlaceholder: 'https://twitter.com/i/status/... or https://x.com/...',
  urlHint: 'Works with twitter.com and x.com video post links.',
  exampleUrl: 'https://x.com/username/status/1234567890123456789',
};

export default function TwitterDownloader() {
  const tool = getToolBySlug('twitter-downloader')!;
  return <VideoDownloaderShell tool={tool} config={config} />;
}
