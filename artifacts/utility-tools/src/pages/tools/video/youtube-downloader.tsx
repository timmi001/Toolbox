import { getToolBySlug } from '@/lib/tools-data';
import { VideoDownloaderShell, PlatformConfig } from '@/components/VideoDownloaderShell';

const YoutubeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
  </svg>
);

const config: PlatformConfig = {
  platform: 'youtube',
  color: 'bg-red-600',
  textColor: 'text-white',
  borderColor: 'border-red-200 dark:border-red-900',
  logo: <YoutubeLogo />,
  urlPlaceholder: 'https://www.youtube.com/watch?v=...',
  urlHint: 'Works with youtube.com/watch, youtu.be short links, YouTube Shorts, and playlists.',
  exampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

export default function YoutubeDownloader() {
  const tool = getToolBySlug('youtube-downloader')!;
  return <VideoDownloaderShell tool={tool} config={config} />;
}
