import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildCutoff(university: string, score: string) {
  const cleanUniversity = university.trim() || 'Your university';
  const cleanScore = Number(score) || 250;
  return `JAMB Cut-off Mark Guide\n\nUniversity: ${cleanUniversity}\nYour score: ${cleanScore}\n\nSuggested interpretation:\n- Above 250: strong chance for competitive courses\n- Around 200–250: likely for many standard courses\n- Below 180: check available programmes and alternative options\n\nReminder: Cut-off marks vary by institution, course, and yearly competition. Always verify with the official admission portal.`;
}

export default function AiJambCutoffChecker() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-jamb-cutoff-checker')!}
      fields={[
        { key: 'university', label: 'Institution', type: 'text', required: true, placeholder: 'e.g. UNILAG, UI, OAU' },
        { key: 'score', label: 'JAMB Score', type: 'text', placeholder: 'e.g. 250' },
      ]}
      buttonLabel="Check Cut-off Insight"
      generate={(inputs) => buildCutoff(inputs.university ?? '', inputs.score ?? '')}
      emptyState="Enter your institution and score to get a quick cut-off interpretation."
      instructions="Use this tool to understand a JAMB score in relation to typical admission expectations."
    />
  );
}
