import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { JourneyState, MoodEntry, MoodId, SessionLog, Settings } from '@/lib/model';
import { todayISO } from '@/lib/dates';
import { JOURNEY_LENGTH } from '@/data/journey';

// NOTE: zustand/middleware's persist crashes expo-router web at import time,
// so persistence is hand-rolled below: hydrateStore() on the client + a
// debounced AsyncStorage save subscribed after hydration. SSR never touches storage.

export interface NowPlaying {
  soundId: string;
  playing: boolean;
}

export interface SleepTimerState {
  minutes: number;
  endsAt: number; // epoch ms
}

interface AppState {
  settings: Settings;
  sessions: SessionLog[];
  moodLog: MoodEntry[];
  journey: JourneyState;
  favoriteSoundIds: string[];
  /** İlk açılış tanıtımı tamamlandı mı (persist edilir) */
  onboardingDone: boolean;
  hydrated: boolean;
  /** Ambient playback UI state (not persisted) */
  nowPlaying?: NowPlaying;
  /** Track repeat (not persisted; default on) */
  loopEnabled: boolean;
  /** Auto-stop timer (not persisted) */
  sleepTimer?: SleepTimerState;

  setNowPlaying: (np: NowPlaying | undefined) => void;
  setLoopEnabled: (on: boolean) => void;
  setSleepTimerState: (t: SleepTimerState | undefined) => void;
  logSession: (log: Omit<SessionLog, 'id'>) => void;
  setMoodToday: (mood: MoodId) => void;
  toggleFavoriteSound: (soundId: string) => void;
  startJourney: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  /** Tanıtımı bitirir ve profil ismini kaydeder */
  completeOnboarding: (name: string) => void;
  resetAll: () => void;
  /** DEV: replace sessions wholesale (seed/demo) */
  replaceSessions: (sessions: SessionLog[]) => void;
}

const defaultSettings: Settings = {
  name: '',
  reminderEnabled: false,
  reminderHour: 21,
  reminderMinute: 30,
  soundEnabled: true,
  hapticsEnabled: true,
  volume: 0.8,
};

const initialData = {
  settings: defaultSettings,
  sessions: [] as SessionLog[],
  moodLog: [] as MoodEntry[],
  journey: { completedDays: [] } as JourneyState,
  favoriteSoundIds: [] as string[],
  onboardingDone: false,
};

let idSeq = 0;
const newId = () => `s-${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

export const useAppStore = create<AppState>()((set) => ({
  ...initialData,
  hydrated: false,
  nowPlaying: undefined,
  loopEnabled: true,
  sleepTimer: undefined,

  setNowPlaying: (np) => set({ nowPlaying: np }),
  setLoopEnabled: (on) => set({ loopEnabled: on }),
  setSleepTimerState: (t) => set({ sleepTimer: t }),

  logSession: (log) => {
    const session: SessionLog = { ...log, id: newId() };
    set((state) => {
      let journey = state.journey;
      // Journey advances at most one day per calendar date, only on completion
      if (
        session.completed &&
        session.journeyDay != null &&
        session.journeyDay >= 1 &&
        session.journeyDay <= JOURNEY_LENGTH &&
        !journey.completedDays.includes(session.journeyDay)
      ) {
        const doneToday = state.sessions.some(
          (s) => s.dateISO === session.dateISO && s.journeyDay != null && s.completed
        );
        if (!doneToday) {
          journey = {
            startDateISO: journey.startDateISO ?? session.dateISO,
            completedDays: [...journey.completedDays, session.journeyDay].sort((a, b) => a - b),
          };
        }
      }
      return { sessions: [...state.sessions, session], journey };
    });
  },

  setMoodToday: (mood) => {
    const date = todayISO();
    set((state) => ({
      moodLog: [...state.moodLog.filter((m) => m.dateISO !== date), { dateISO: date, mood }],
    }));
  },

  toggleFavoriteSound: (soundId) =>
    set((state) => ({
      favoriteSoundIds: state.favoriteSoundIds.includes(soundId)
        ? state.favoriteSoundIds.filter((id) => id !== soundId)
        : [...state.favoriteSoundIds, soundId],
    })),

  startJourney: () =>
    set((state) =>
      state.journey.startDateISO ? {} : { journey: { ...state.journey, startDateISO: todayISO() } }
    ),

  updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

  completeOnboarding: (name) =>
    set((state) => ({
      settings: { ...state.settings, name: name.trim() },
      onboardingDone: true,
    })),

  resetAll: () => set({ ...initialData, settings: { ...defaultSettings } }),

  replaceSessions: (sessions) => set({ sessions }),
}));

const STORAGE_KEY = 'halsa-store-v1';

function persistNow() {
  const { settings, sessions, moodLog, journey, favoriteSoundIds, onboardingDone } =
    useAppStore.getState();
  return AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ v: 1, settings, sessions, moodLog, journey, favoriteSoundIds, onboardingDone })
  ).catch(() => {});
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 250);
}

let hydrateStarted = false;

/** Load persisted state, then start auto-saving. Call once from a client-side effect. */
export async function hydrateStore() {
  if (hydrateStarted) return;
  hydrateStarted = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      useAppStore.setState({
        settings: { ...defaultSettings, ...(data.settings ?? {}) },
        sessions: Array.isArray(data.sessions) ? data.sessions : [],
        moodLog: Array.isArray(data.moodLog) ? data.moodLog : [],
        journey: data.journey?.completedDays ? data.journey : { completedDays: [] },
        favoriteSoundIds: Array.isArray(data.favoriteSoundIds) ? data.favoriteSoundIds : [],
        onboardingDone: data.onboardingDone === true,
      });
    }
  } catch {
    // Corrupt storage: keep defaults
  }
  useAppStore.setState({ hydrated: true });
  useAppStore.subscribe(scheduleSave);
}

/** Next uncompleted journey day (1..30); null when the journey is finished */
export function activeJourneyDay(journey: JourneyState): number | null {
  for (let d = 1; d <= JOURNEY_LENGTH; d++) {
    if (!journey.completedDays.includes(d)) return d;
  }
  return null;
}

/** True when today's journey session is already done */
export function journeyDoneToday(sessions: SessionLog[]): boolean {
  const date = todayISO();
  return sessions.some((s) => s.dateISO === date && s.journeyDay != null && s.completed);
}

export function moodOfToday(moodLog: MoodEntry[]): MoodId | undefined {
  return moodLog.find((m) => m.dateISO === todayISO())?.mood;
}
