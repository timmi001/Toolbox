import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPriceTracker() {
  return <AiToolShell tool={getToolBySlug('ai-price-tracker')!} />;
}
