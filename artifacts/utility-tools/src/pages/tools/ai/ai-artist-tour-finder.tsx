import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiArtistTourFinder() {
  return <AiToolShell tool={getToolBySlug('ai-artist-tour-finder')!} />;
}
