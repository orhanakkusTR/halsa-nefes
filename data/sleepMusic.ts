import { Ionicons } from '@expo/vector-icons';

export interface SleepTrack {
  id: string;
  title: string;
  /** Şimdi Çalıyor grid'i için kısa ad ("Deep Sleep" gibi) */
  shortTitle: string;
  subtitle: string;
  /** mm:ss gösterimi için saniye */
  durationSec: number;
  icon: keyof typeof Ionicons.glyphMap;
  tile: [string, string];
  file: number;
}

// Standalone sleep music — plays without a breathing session.
export const sleepTracks: SleepTrack[] = [
  {
    id: 'uyku-meditasyonu',
    title: 'Uyku Meditasyonu',
    shortTitle: 'Meditation',
    subtitle: 'Yavaş, derin ve sakinleştirici',
    durationSec: 566,
    icon: 'moon',
    tile: ['#2A2550', '#141127'],
    file: require('@/assets/music/uyku-meditasyonu.mp3'),
  },
  {
    id: 'uyku-muzigi',
    title: 'Uyku Müziği',
    shortTitle: 'Relax Sleep',
    subtitle: 'Uykuya yumuşak bir geçiş',
    durationSec: 314,
    icon: 'cloudy-night',
    tile: ['#1E2A55', '#0E1430'],
    file: require('@/assets/music/uyku-muzigi.mp3'),
  },
  {
    id: 'derin-uyku',
    title: 'Derin Uyku',
    shortTitle: 'Deep Sleep',
    subtitle: 'Gece boyu dinginlik',
    durationSec: 547,
    icon: 'bed',
    tile: ['#1A1E3E', '#0B0D1F'],
    file: require('@/assets/music/derin-uyku.mp3'),
  },
];

export const sleepTrackById = (id: string | undefined) =>
  sleepTracks.find((t) => t.id === id);

export function formatTrackDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
