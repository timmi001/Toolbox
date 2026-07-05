import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiSqlGenerator() {
  return <AiToolShell tool={getToolBySlug('ai-sql-generator')!} />;
}
