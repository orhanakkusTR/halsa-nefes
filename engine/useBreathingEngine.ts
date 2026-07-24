import { useCallback, useEffect, useRef, useState } from 'react';
import { BreathPattern, plannedCycles } from './types';

export type EngineStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface PhaseEvent {
  phaseIndex: number;
  /** Full duration of this phase in ms */
  durationMs: number;
  /** Time already elapsed inside the phase (0 on natural entry, >0 on resume) */
  elapsedInPhaseMs: number;
  cycle: number;
}

export interface BreathingEngine {
  status: EngineStatus;
  /** Index into pattern.phases */
  phaseIndex: number;
  /** Whole seconds left in the current phase (counts N..1) */
  secondsLeft: number;
  /** 1-based current cycle */
  cycle: number;
  cyclesPlanned: number;
  /** Total practiced seconds (excludes paused time) */
  elapsedSec: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  /** Stop and report elapsed seconds (also used on unmount/exit) */
  stop: () => number;
}

interface Options {
  pattern: BreathPattern;
  minutes: number;
  /** Fired at every phase entry AND on resume — drives the ring animation */
  onPhase?: (e: PhaseEvent) => void;
  /** Fired on pause so the renderer can freeze */
  onPause?: () => void;
  onComplete?: (elapsedSec: number) => void;
}

const TICK_MS = 200;

export function useBreathingEngine({ pattern, minutes, onPhase, onPause, onComplete }: Options): BreathingEngine {
  const cyclesPlanned = plannedCycles(pattern, minutes);

  const [status, setStatus] = useState<EngineStatus>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].seconds);
  const [cycle, setCycle] = useState(1);

  // Mutable clock state (no re-render churn)
  const ref = useRef({
    phaseIndex: 0,
    cycle: 1,
    phaseStartMs: 0, // Date.now() when the current phase (re)started
    phaseElapsedBeforePauseMs: 0, // accumulated in current phase before last pause
    totalElapsedMs: 0, // accumulated across finished phases
    status: 'idle' as EngineStatus,
  });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cbRef = useRef({ onPhase, onPause, onComplete });
  cbRef.current = { onPhase, onPause, onComplete };

  const clearTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const phaseDurMs = useCallback(
    (idx: number) => pattern.phases[idx].seconds * 1000,
    [pattern]
  );

  const enterPhase = useCallback(
    (idx: number, cyc: number) => {
      const r = ref.current;
      r.phaseIndex = idx;
      r.cycle = cyc;
      r.phaseStartMs = Date.now();
      r.phaseElapsedBeforePauseMs = 0;
      setPhaseIndex(idx);
      setCycle(cyc);
      setSecondsLeft(pattern.phases[idx].seconds);
      cbRef.current.onPhase?.({
        phaseIndex: idx,
        durationMs: phaseDurMs(idx),
        elapsedInPhaseMs: 0,
        cycle: cyc,
      });
    },
    [pattern, phaseDurMs]
  );

  const finish = useCallback(() => {
    const r = ref.current;
    r.status = 'finished';
    clearTimer();
    setStatus('finished');
    cbRef.current.onComplete?.(Math.round(r.totalElapsedMs / 1000));
  }, []);

  const tick = useCallback(() => {
    const r = ref.current;
    if (r.status !== 'running') return;
    const inPhase = r.phaseElapsedBeforePauseMs + (Date.now() - r.phaseStartMs);
    const dur = phaseDurMs(r.phaseIndex);

    if (inPhase >= dur) {
      r.totalElapsedMs += dur;
      const nextIdx = (r.phaseIndex + 1) % pattern.phases.length;
      if (nextIdx === 0) {
        if (r.cycle >= cyclesPlanned) {
          finish();
          return;
        }
        enterPhase(0, r.cycle + 1);
      } else {
        enterPhase(nextIdx, r.cycle);
      }
      return;
    }

    const left = Math.max(1, Math.ceil((dur - inPhase) / 1000));
    setSecondsLeft((prev) => (prev === left ? prev : left));
  }, [pattern, cyclesPlanned, enterPhase, finish, phaseDurMs]);

  const start = useCallback(() => {
    const r = ref.current;
    if (r.status === 'running') return;
    r.status = 'running';
    r.totalElapsedMs = 0;
    setStatus('running');
    enterPhase(0, 1);
    clearTimer();
    timer.current = setInterval(tick, TICK_MS);
  }, [enterPhase, tick]);

  const pause = useCallback(() => {
    const r = ref.current;
    if (r.status !== 'running') return;
    r.phaseElapsedBeforePauseMs += Date.now() - r.phaseStartMs;
    r.status = 'paused';
    clearTimer();
    setStatus('paused');
    cbRef.current.onPause?.();
  }, []);

  const resume = useCallback(() => {
    const r = ref.current;
    if (r.status !== 'paused') return;
    r.phaseStartMs = Date.now();
    r.status = 'running';
    setStatus('running');
    cbRef.current.onPhase?.({
      phaseIndex: r.phaseIndex,
      durationMs: phaseDurMs(r.phaseIndex),
      elapsedInPhaseMs: r.phaseElapsedBeforePauseMs,
      cycle: r.cycle,
    });
    timer.current = setInterval(tick, TICK_MS);
  }, [phaseDurMs, tick]);

  const stop = useCallback(() => {
    const r = ref.current;
    let total = r.totalElapsedMs;
    if (r.status === 'running') total += r.phaseElapsedBeforePauseMs + (Date.now() - r.phaseStartMs);
    else if (r.status === 'paused') total += r.phaseElapsedBeforePauseMs;
    if (r.status !== 'finished') {
      r.status = 'idle';
      clearTimer();
    }
    return Math.round(total / 1000);
  }, []);

  useEffect(() => clearTimer, []);

  const elapsedSec = Math.round(ref.current.totalElapsedMs / 1000);

  return {
    status,
    phaseIndex,
    secondsLeft,
    cycle,
    cyclesPlanned,
    elapsedSec,
    start,
    pause,
    resume,
    stop,
  };
}
