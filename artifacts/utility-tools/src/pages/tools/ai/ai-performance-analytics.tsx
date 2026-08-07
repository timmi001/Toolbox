import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPerformanceAnalytics() {
  return <AiToolShell tool={getToolBySlug('ai-performance-analytics')!} />;
}
