import { exercises } from '@/data/exercises';
import { plannedCycles } from '@/engine/types';
import { addDaysISO, parseISO, todayISO } from '@/lib/dates';
import type { SessionLog } from '@/lib/model';
import { useAppStore } from '@/store/appStore';

// DEV-only: deterministic demo dataset (~5 weeks) to exercise charts & badges.
export function seedDemoData() {
  const today = todayISO();
  let s = 42;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };

  const sessions: SessionLog[] = [];
  const push = (dateISO: string, i: number, forceMorning = false) => {
    const exercise = exercises[Math.floor(rnd() * exercises.length)];
    const minutes = exercise.durations[Math.floor(rnd() * exercise.durations.length)];
    const morning = forceMorning || rnd() < 0.12;
    const hour = morning ? 7 : 21;
    const cycles = plannedCycles(exercise.pattern, minutes);
    sessions.push({
      id: `demo-${dateISO}-${i}`,
      dateISO,
      startedAt: parseISO(dateISO).getTime() + hour * 3600_000 + Math.floor(rnd() * 45) * 60_000,
      exerciseId: exercise.id,
      minutesPlanned: minutes,
      secondsCompleted: minutes * 60,
      cyclesCompleted: cycles,
      cyclesPlanned: cycles,
      completed: true,
    });
  };

  for (let i = 34; i >= 0; i--) {
    const date = addDaysISO(today, -i);
    if (rnd() < 0.78) {
      push(date, i);
      if (rnd() < 0.25) push(date, i + 100);
    }
  }
  // Guarantee an 8-day live streak (7 Gün badge + today's state)
  for (let i = 7; i >= 0; i--) {
    const date = addDaysISO(today, -i);
    if (!sessions.some((x) => x.dateISO === date)) push(date, 200 + i, i === 5);
  }
  // Guarantee one early-bird session
  if (!sessions.some((x) => new Date(x.startedAt).getHours() < 9)) {
    push(addDaysISO(today, -3), 300, true);
  }

  useAppStore.setState({
    sessions,
    journey: {
      startDateISO: addDaysISO(today, -12),
      completedDays: Array.from({ length: 12 }, (_, i) => i + 1),
    },
  });
}
