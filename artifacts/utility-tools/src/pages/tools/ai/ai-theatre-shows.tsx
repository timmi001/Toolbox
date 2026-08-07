import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTheatreShows() {
  return <AiToolShell tool={getToolBySlug('ai-theatre-shows')!} />;
}
