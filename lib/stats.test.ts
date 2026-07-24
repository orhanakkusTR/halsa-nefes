import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SessionLog } from './model.ts';
import {
  avgSessionMinutes,
  completedDaysInRange,
  currentStreak,
  deltaVsPrevious,
  habitSeries,
  hasEarlyBirdSession,
  longestStreak,
  minutesSeries,
  successRate,
  totalMinutes,
} from './stats.ts';
import { addDaysISO, diffDays, lastNDaysISO, monthDaysISO } from './dates.ts';

let seq = 0;
function s(dateISO: string, opts: Partial<SessionLog> = {}): SessionLog {
  seq++;
  return {
    id: `t${seq}`,
    dateISO,
    startedAt: new Date(`${dateISO}T21:30:00`).getTime(),
    exerciseId: 'uyumadan-once',
    minutesPlanned: 10,
    secondsCompleted: 600,
    cyclesCompleted: 40,
    cyclesPlanned: 43,
    completed: true,
    ...opts,
  };
}

test('date helpers', () => {
  assert.equal(addDaysISO('2026-03-01', -1), '2026-02-28');
  assert.equal(addDaysISO('2024-02-28', 1), '2024-02-29'); // leap year
  assert.equal(diffDays('2026-06-30', '2026-07-02'), 2);
  assert.equal(monthDaysISO('2026-02-10').length, 28);
  assert.deepEqual(lastNDaysISO(3, '2026-07-24'), ['2026-07-22', '2026-07-23', '2026-07-24']);
});

test('currentStreak counts back from today', () => {
  const sessions = [s('2026-07-22'), s('2026-07-23'), s('2026-07-24')];
  assert.equal(currentStreak(sessions, '2026-07-24'), 3);
});

test('currentStreak falls back to yesterday when today is empty', () => {
  const sessions = [s('2026-07-22'), s('2026-07-23')];
  assert.equal(currentStreak(sessions, '2026-07-24'), 2);
});

test('currentStreak is 0 after a gap', () => {
  const sessions = [s('2026-07-20')];
  assert.equal(currentStreak(sessions, '2026-07-24'), 0);
});

test('incomplete sessions do not extend streaks', () => {
  const sessions = [s('2026-07-23'), s('2026-07-24', { completed: false, secondsCompleted: 60 })];
  assert.equal(currentStreak(sessions, '2026-07-24'), 1);
});

test('longestStreak finds the best historical run', () => {
  const sessions = [
    s('2026-07-01'), s('2026-07-02'), s('2026-07-03'), s('2026-07-04'),
    s('2026-07-10'), s('2026-07-11'),
  ];
  assert.equal(longestStreak(sessions), 4);
});

test('two sessions on the same day count once for streaks', () => {
  const sessions = [s('2026-07-23'), s('2026-07-23'), s('2026-07-24')];
  assert.equal(currentStreak(sessions, '2026-07-24'), 2);
  assert.equal(longestStreak(sessions), 2);
});

test('totalMinutes respects range boundaries', () => {
  const sessions = [s('2026-06-30'), s('2026-07-01'), s('2026-07-24')];
  assert.equal(totalMinutes(sessions, 'month', '2026-07-24'), 20);
  assert.equal(totalMinutes(sessions, 'year', '2026-07-24'), 30);
});

test('minutesSeries buckets week/month/year', () => {
  const sessions = [s('2026-07-23'), s('2026-07-24'), s('2026-07-24')];
  const week = minutesSeries(sessions, 'week', '2026-07-24');
  assert.equal(week.values.length, 7);
  assert.equal(week.values[6], 20); // today: two sessions
  assert.equal(week.values[5], 10);

  const month = minutesSeries(sessions, 'month', '2026-07-24');
  assert.equal(month.values.length, 31); // July
  assert.equal(month.values[23], 20);

  const year = minutesSeries(sessions, 'year', '2026-07-24');
  assert.equal(year.values.length, 12);
  assert.equal(year.values[6], 30); // July total
});

test('completedDaysInRange and successRate', () => {
  const sessions = [s('2026-07-20'), s('2026-07-21'), s('2026-07-22'), s('2026-07-23')];
  assert.equal(completedDaysInRange(sessions, 'month', '2026-07-24'), 4);
  // elapsed 24 days in July, 4 completed
  assert.equal(successRate(sessions, 'month', '2026-07-24'), Math.round((4 / 24) * 100));
  // last-7-day window: 4/7
  assert.equal(successRate(sessions, 'week', '2026-07-24'), Math.round((4 / 7) * 100));
});

test('avgSessionMinutes ignores incomplete sessions', () => {
  const sessions = [
    s('2026-07-23', { secondsCompleted: 300 }),
    s('2026-07-24', { secondsCompleted: 900 }),
    s('2026-07-24', { completed: false, secondsCompleted: 30 }),
  ];
  assert.equal(avgSessionMinutes(sessions, 'month', '2026-07-24'), 10);
});

test('deltaVsPrevious compares equivalent periods', () => {
  const sessions = [
    // previous week: 10 min, current week: 20 min → +100%
    s('2026-07-15'), s('2026-07-23'), s('2026-07-24'),
  ];
  assert.equal(deltaVsPrevious(sessions, 'week', '2026-07-24'), 100);
  assert.equal(deltaVsPrevious([], 'week', '2026-07-24'), null);
});

test('habitSeries samples rolling 7-day windows weekly', () => {
  const sessions = lastNDaysISO(7, '2026-07-24').map((d) => s(d));
  const series = habitSeries(sessions, '2026-07-24', 5);
  assert.equal(series.length, 5);
  assert.equal(series[4].pct, 100);
  assert.equal(series[0].pct, 0);
});

test('hasEarlyBirdSession checks local clock time', () => {
  const early = s('2026-07-24', { startedAt: new Date('2026-07-24T07:30:00').getTime() });
  const late = s('2026-07-24');
  assert.equal(hasEarlyBirdSession([late]), false);
  assert.equal(hasEarlyBirdSession([late, early]), true);
});
