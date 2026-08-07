import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiFestivalFinder() {
  return <AiToolShell tool={getToolBySlug('ai-festival-finder')!} />;
}
