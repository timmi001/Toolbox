import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiInstagramCaption() {
  return <AiToolShell tool={getToolBySlug('ai-instagram-caption')!} />;
}
