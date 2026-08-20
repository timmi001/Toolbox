const DAILY_BRIEF_STORAGE_KEY = 'toolbuxx_daily_brief_v1';

type StoredBrief = { date: string; content: string; createdAt: string };

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyBrief(date = new Date()): StoredBrief | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DAILY_BRIEF_STORAGE_KEY);
    if (!raw) return null;
    const brief = JSON.parse(raw) as StoredBrief;
    return brief.date === dateKey(date) && brief.content ? brief : null;
  } catch {
    return null;
  }
}

export function saveDailyBrief(content: string, date = new Date()): StoredBrief {
  const brief = { date: dateKey(date), content: content.trim(), createdAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(DAILY_BRIEF_STORAGE_KEY, JSON.stringify(brief));
    } catch {
      // Persistence is best effort; the current result remains visible in memory.
    }
  }
  return brief;
}
