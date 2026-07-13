import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSalesEmail() {
  return <AiToolShell tool={getToolBySlug('ai-sales-email')!} />;
}
