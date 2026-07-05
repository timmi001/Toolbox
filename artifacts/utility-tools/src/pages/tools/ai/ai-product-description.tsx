import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiProductDescription() {
  return <AiToolShell tool={getToolBySlug('ai-product-description')!} />;
}
