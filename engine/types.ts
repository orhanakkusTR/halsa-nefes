export type PhaseKind = 'inhale' | 'hold' | 'exhale' | 'holdOut';

export interface BreathPhase {
  kind: PhaseKind;
  seconds: number;
  label: string; // 'Nefes Al' | 'Bekle' | 'Nefes Ver'
}

export interface BreathPattern {
  id: string;
  phases: BreathPhase[];
}

export const cycleSeconds = (p: BreathPattern) =>
  p.phases.reduce((sum, ph) => sum + ph.seconds, 0);

export const plannedCycles = (p: BreathPattern, minutes: number) =>
  Math.max(1, Math.round((minutes * 60) / cycleSeconds(p)));

const phase = (kind: PhaseKind, seconds: number): BreathPhase => ({
  kind,
  seconds,
  label: kind === 'inhale' ? 'Nefes Al' : kind === 'exhale' ? 'Nefes Ver' : 'Bekle',
});

export const patterns = {
  /** 4-4-6 — relax before sleep */
  relax446: {
    id: '4-4-6',
    phases: [phase('inhale', 4), phase('hold', 4), phase('exhale', 6)],
  },
  /** Box breathing 4-4-4-4 */
  box4444: {
    id: '4-4-4-4',
    phases: [phase('inhale', 4), phase('hold', 4), phase('exhale', 4), phase('holdOut', 4)],
  },
  /** Calm the mind 4-6 */
  calm46: {
    id: '4-6',
    phases: [phase('inhale', 4), phase('exhale', 6)],
  },
  /** Deep sleep 4-7-8 */
  sleep478: {
    id: '4-7-8',
    phases: [phase('inhale', 4), phase('hold', 7), phase('exhale', 8)],
  },
  /** Morning energy 4-4 */
  energy44: {
    id: '4-4',
    phases: [phase('inhale', 4), phase('exhale', 4)],
  },
  /** Coherent focus 5-5 */
  focus55: {
    id: '5-5',
    phases: [phase('inhale', 5), phase('exhale', 5)],
  },
} as const satisfies Record<string, BreathPattern>;
