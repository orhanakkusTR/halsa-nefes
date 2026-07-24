import { Ionicons } from '@expo/vector-icons';
import type { SessionLog } from '@/lib/model';
import {
  currentStreak,
  hasEarlyBirdSession,
  longestStreak,
  totalCompletedSessions,
} from '@/lib/stats';
import { colors } from '@/theme';

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isUnlocked: (sessions: SessionLog[], today: string) => boolean;
}

export const badges: Badge[] = [
  {
    id: '7-gun',
    title: '7 Gün',
    subtitle: '7 günlük seri',
    icon: 'star',
    color: colors.primary,
    isUnlocked: (s, today) => Math.max(longestStreak(s), currentStreak(s, today)) >= 7,
  },
  {
    id: '30-gun',
    title: '30 Gün',
    subtitle: '30 günlük seri',
    icon: 'shield-checkmark',
    color: colors.sky,
    isUnlocked: (s, today) => Math.max(longestStreak(s), currentStreak(s, today)) >= 30,
  },
  {
    id: 'erken-kus',
    title: 'Erken Kuş',
    subtitle: '09:00 öncesi bir seans',
    icon: 'partly-sunny',
    color: colors.violet,
    isUnlocked: (s) => hasEarlyBirdSession(s),
  },
  {
    id: 'nefes-ustasi',
    title: 'Nefes Ustası',
    subtitle: '50 tamamlanan seans',
    icon: 'medal',
    color: colors.gold,
    isUnlocked: (s) => totalCompletedSessions(s) >= 50,
  },
];
