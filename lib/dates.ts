/** Local-time date helpers. All app date bucketing uses 'YYYY-MM-DD' local strings. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function diffDays(fromISO: string, toISO: string): number {
  const ms = parseISO(toISO).getTime() - parseISO(fromISO).getTime();
  return Math.round(ms / 86400000);
}

/** Last `n` days ending at `endISO` (inclusive), oldest first */
export function lastNDaysISO(n: number, endISO: string): string[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(endISO, i - (n - 1)));
}

/** Every day of the calendar month containing `iso`, oldest first */
export function monthDaysISO(iso: string): string[] {
  const d = parseISO(iso);
  const year = d.getFullYear();
  const month = d.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => toISODate(new Date(year, month, i + 1)));
}

/** 'YYYY-MM' key */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** 12 month keys of the year containing `iso`, oldest first */
export function yearMonthKeys(iso: string): string[] {
  const year = iso.slice(0, 4);
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
}

export const TURKISH_MONTHS_SHORT = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
] as const;

/** '8 May' style short label */
export function shortDayLabel(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${TURKISH_MONTHS_SHORT[d.getMonth()]}`;
}

export const TURKISH_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] as const;

export function weekdayLabel(iso: string): string {
  return TURKISH_DAYS_SHORT[parseISO(iso).getDay()];
}

export function formatMinutes(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h <= 0) return `${m} dk`;
  return `${h} sa ${m} dk`;
}
