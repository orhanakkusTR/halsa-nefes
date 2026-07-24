import type { SessionLog } from './model.ts';
import {
  addDaysISO,
  lastNDaysISO,
  monthDaysISO,
  monthKey,
  parseISO,
  shortDayLabel,
  toISODate,
  weekdayLabel,
  yearMonthKeys,
  TURKISH_MONTHS_SHORT,
} from './dates.ts';

export type Range = 'week' | 'month' | 'year';

const byDay = (sessions: SessionLog[]) => {
  const map = new Map<string, SessionLog[]>();
  for (const s of sessions) {
    const list = map.get(s.dateISO);
    if (list) list.push(s);
    else map.set(s.dateISO, [s]);
  }
  return map;
};

/** Dates (ISO) that contain at least one completed session */
export function completedDates(sessions: SessionLog[]): Set<string> {
  const set = new Set<string>();
  for (const s of sessions) if (s.completed) set.add(s.dateISO);
  return set;
}

/** Consecutive completed days ending today (or yesterday if today has none yet) */
export function currentStreak(sessions: SessionLog[], today: string): number {
  const done = completedDates(sessions);
  let cursor = done.has(today) ? today : addDaysISO(today, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

export function longestStreak(sessions: SessionLog[]): number {
  const done = [...completedDates(sessions)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of done) {
    run = prev !== null && addDaysISO(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

function minutesOf(list: SessionLog[] | undefined): number {
  if (!list) return 0;
  return list.reduce((sum, s) => sum + s.secondsCompleted / 60, 0);
}

/** Dates covered by a range, oldest first. Week: last 7 days. Month/year: calendar period containing `today`. */
export function rangeDates(range: Range, today: string): string[] {
  if (range === 'week') return lastNDaysISO(7, today);
  if (range === 'month') return monthDaysISO(today);
  return []; // year handled via month keys
}

export interface Series {
  labels: string[];
  values: number[];
}

/** Minutes-per-bucket series feeding the bar chart */
export function minutesSeries(sessions: SessionLog[], range: Range, today: string): Series {
  const daily = byDay(sessions);
  if (range === 'year') {
    const keys = yearMonthKeys(today);
    const perMonth = new Map<string, number>();
    for (const s of sessions) {
      const k = monthKey(s.dateISO);
      perMonth.set(k, (perMonth.get(k) ?? 0) + s.secondsCompleted / 60);
    }
    return {
      labels: keys.map((k) => TURKISH_MONTHS_SHORT[Number(k.slice(5)) - 1]),
      values: keys.map((k) => Math.round(perMonth.get(k) ?? 0)),
    };
  }
  const days = rangeDates(range, today);
  return {
    labels:
      range === 'week'
        ? days.map(weekdayLabel)
        : days.map((d, i) => (i % 7 === 0 ? shortDayLabel(d) : '')),
    values: days.map((d) => Math.round(minutesOf(daily.get(d)))),
  };
}

function inRange(range: Range, today: string, dateISO: string): boolean {
  if (range === 'week') {
    const start = addDaysISO(today, -6);
    return dateISO >= start && dateISO <= today;
  }
  if (range === 'month') return monthKey(dateISO) === monthKey(today);
  return dateISO.slice(0, 4) === today.slice(0, 4);
}

export function sessionsInRange(sessions: SessionLog[], range: Range, today: string): SessionLog[] {
  return sessions.filter((s) => inRange(range, today, s.dateISO));
}

export function totalMinutes(sessions: SessionLog[], range: Range, today: string): number {
  return Math.round(minutesOf(sessionsInRange(sessions, range, today)));
}

/** % change vs the equivalent previous period; null when previous period is empty */
export function deltaVsPrevious(sessions: SessionLog[], range: Range, today: string): number | null {
  let prevAnchor: string;
  if (range === 'week') prevAnchor = addDaysISO(today, -7);
  else if (range === 'month') {
    const d = parseISO(today);
    prevAnchor = toISODate(new Date(d.getFullYear(), d.getMonth() - 1, 15));
  } else prevAnchor = `${Number(today.slice(0, 4)) - 1}${today.slice(4)}`;

  const cur = totalMinutes(sessions, range, today);
  const prev = totalMinutes(sessions, range, prevAnchor);
  if (prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

/** Days in the range with a completed session ("28 Gün Rutin Tamamlama") */
export function completedDaysInRange(sessions: SessionLog[], range: Range, today: string): number {
  const done = completedDates(sessions);
  if (range === 'year') {
    return [...done].filter((d) => d.slice(0, 4) === today.slice(0, 4)).length;
  }
  const days = rangeDates(range, today);
  return days.filter((d) => done.has(d)).length;
}

/** Average completed-session length in minutes */
export function avgSessionMinutes(sessions: SessionLog[], range: Range, today: string): number {
  const list = sessionsInRange(sessions, range, today).filter((s) => s.completed);
  if (list.length === 0) return 0;
  return Math.round(minutesOf(list) / list.length);
}

/** Completed days ÷ elapsed days in the period (days that already happened) */
export function successRate(sessions: SessionLog[], range: Range, today: string): number {
  const done = completedDates(sessions);
  let elapsed: string[];
  if (range === 'week') elapsed = lastNDaysISO(7, today);
  else if (range === 'month') elapsed = monthDaysISO(today).filter((d) => d <= today);
  else {
    const start = `${today.slice(0, 4)}-01-01`;
    const days: string[] = [];
    let cursor = start;
    while (cursor <= today) {
      days.push(cursor);
      cursor = addDaysISO(cursor, 1);
    }
    elapsed = days;
  }
  if (elapsed.length === 0) return 0;
  return Math.round((elapsed.filter((d) => done.has(d)).length / elapsed.length) * 100);
}

/** Rolling 7-day completion %, sampled weekly (oldest first) — feeds the habit line chart */
export function habitSeries(
  sessions: SessionLog[],
  today: string,
  samples = 5
): { label: string; pct: number }[] {
  const done = completedDates(sessions);
  const out: { label: string; pct: number }[] = [];
  for (let i = samples - 1; i >= 0; i--) {
    const end = addDaysISO(today, -7 * i);
    const window = lastNDaysISO(7, end);
    const pct = Math.round((window.filter((d) => done.has(d)).length / 7) * 100);
    out.push({ label: shortDayLabel(end), pct });
  }
  return out;
}

export function totalCompletedSessions(sessions: SessionLog[]): number {
  return sessions.filter((s) => s.completed).length;
}

export function totalMinutesAll(sessions: SessionLog[]): number {
  return Math.round(minutesOf(sessions));
}

/** Any completed session started before 09:00 local time */
export function hasEarlyBirdSession(sessions: SessionLog[]): boolean {
  return sessions.some((s) => s.completed && new Date(s.startedAt).getHours() < 9);
}
