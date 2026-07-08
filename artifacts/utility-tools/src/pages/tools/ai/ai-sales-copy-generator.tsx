import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSalesCopyGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-sales-copy-generator')!} />;
}
