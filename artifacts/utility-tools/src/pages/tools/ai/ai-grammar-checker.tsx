import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiGrammarChecker() {
  return <AiToolShell tool={getToolBySlug('ai-grammar-checker')!} />;
}
