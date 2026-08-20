const ACTIVITY_STORAGE_KEY = 'toolbuxx_activity_v1';

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function loadActivityDates(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function saveActivityDates(dates: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(dates));
    window.dispatchEvent(new CustomEvent('toolbuxx-activity-updated'));
  } catch {
    // Private browsing and quota errors should not block a successful tool run.
  }
}

export function markActivity(date = new Date()): number {
  const key = todayKey(date);
  const dates = new Set(loadActivityDates());
  dates.add(key);
  saveActivityDates([...dates].sort().slice(-366));
  return getCurrentStreak(date);
}

export function getCurrentStreak(date = new Date()): number {
  const dates = new Set(loadActivityDates());
  let streak = 0;
  const cursor = new Date(date);
  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function hasActivityToday(date = new Date()): boolean {
  return loadActivityDates().includes(todayKey(date));
}

export function getActivityDates(): string[] {
  return loadActivityDates();
}
