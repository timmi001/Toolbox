import { getToolBySlug } from '@/lib/tools-data';
import { AiToolShell } from '@/components/AiToolShell';

export default function AiPdfPracticePapers() {
  return <AiToolShell tool={getToolBySlug('ai-pdf-practice-papers')!} />;
}
