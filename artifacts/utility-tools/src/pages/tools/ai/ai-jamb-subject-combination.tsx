import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildCombination(course: string) {
  const clean = course.trim() || 'Computer Science';
  return `Subject Combination Guidance\n\nTarget course: ${clean}\n\nSuggested UTME subjects:\n- English Language\n- Mathematics\n- Physics\n- Chemistry\n\nTip: Always confirm the exact requirements from the official JAMB brochure or your institution before registering.`;
}

export default function AiJambSubjectCombination() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-jamb-subject-combination')!}
      fields={[
        { key: 'course', label: 'Course / Programme', type: 'text', required: true, placeholder: 'e.g. Computer Science, Law, Medicine' },
      ]}
      buttonLabel="Suggest Subjects"
      generate={(inputs) => buildCombination(inputs.course ?? '')}
      emptyState="Enter a course to get a suggested JAMB subject combination."
      instructions="Use this tool to generate a general JAMB subject combination guide for a course."
    />
  );
}
