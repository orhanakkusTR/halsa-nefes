export type MoodId = 'calm' | 'stressed' | 'veryStressed' | 'tired';

export interface SessionLog {
  id: string;
  /** 'YYYY-MM-DD' in local time — all stats bucket on this */
  dateISO: string;
  /** epoch ms — badge rules need clock time */
  startedAt: number;
  exerciseId: string;
  minutesPlanned: number;
  secondsCompleted: number;
  cyclesCompleted: number;
  cyclesPlanned: number;
  /** >= 80% of planned seconds */
  completed: boolean;
  journeyDay?: number;
  moodBefore?: MoodId;
}

export interface MoodEntry {
  dateISO: string;
  mood: MoodId;
}

export interface Settings {
  name: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  volume: number; // 0..1
  lastSoundId?: string;
}

export interface JourneyState {
  startDateISO?: string;
  completedDays: number[]; // 1..30
}
