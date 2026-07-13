import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiTiktokCaption() {
  return <AiToolShell tool={getToolBySlug('ai-tiktok-caption')!} />;
}
