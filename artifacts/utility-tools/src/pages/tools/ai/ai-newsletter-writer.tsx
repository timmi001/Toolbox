import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiNewsletterWriter() {
  return <AiToolShell tool={getToolBySlug('ai-newsletter-writer')!} />;
}
