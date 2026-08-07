import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiWeakTopicAnalyzer() {
  return <AiToolShell tool={getToolBySlug('ai-weak-topic-analyzer')!} />;
}
