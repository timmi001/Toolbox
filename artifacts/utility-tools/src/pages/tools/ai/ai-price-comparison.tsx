import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPriceComparison() {
  return <AiToolShell tool={getToolBySlug('ai-price-comparison')!} />;
}
