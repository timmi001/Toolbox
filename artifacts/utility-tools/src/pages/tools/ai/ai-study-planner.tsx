import { getToolBySlug } from '@/lib/tools-data';
import { LocalToolShell } from '@/components/LocalToolShell';

function buildPlanner(topic: string, days: string) {
  const base = topic.trim() || 'your subject';
  const count = Number(days) || 7;
  return `Study Plan for ${base}\n\nDuration: ${count} days\n\nDay 1: Review the main topic and collect notes.\nDay 2: Learn the key concepts and definitions.\nDay 3: Practice 10 questions or problems.\nDay 4: Summarize what you learned in your own words.\nDay 5: Review weak areas and write short explanations.\nDay 6: Test yourself without notes.\nDay 7: Revise everything and prepare for the exam.`;
}

export default function AiStudyPlanner() {
  return (
    <LocalToolShell
      tool={getToolBySlug('ai-study-planner')!}
      fields={[
        { key: 'topic', label: 'Study Topic', type: 'text', required: true, placeholder: 'e.g. Biology revision' },
        { key: 'days', label: 'Number of Days', type: 'select', options: ['3', '5', '7', '14'] },
      ]}
      buttonLabel="Create Plan"
      generate={(inputs) => buildPlanner(inputs.topic ?? '', inputs.days ?? '7')}
      emptyState="Enter a topic and create a practical study schedule."
      instructions="Use this tool to build a simple study timetable for exams or revision."
    />
  );
}
