import { Ionicons } from '@expo/vector-icons';
import { BreathPattern, patterns } from '@/engine/types';
import { colors } from '@/theme';

export interface Exercise {
  id: string;
  title: string;
  /** Title shown in the player ("Rahatla & Nefes Al" for the flagship) */
  playerTitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  pattern: BreathPattern;
  /** Selectable duration variants in minutes */
  durations: number[];
  /** Label per duration on the Home cards (flagship only) */
  durationLabels?: Record<number, string>;
}

export const exercises: Exercise[] = [
  {
    id: 'uyumadan-once',
    title: 'Uyumadan Önce Rahatla',
    playerTitle: 'Rahatla & Nefes Al',
    description: 'Gevşe, nefes al ve günü geride bırak. Uykuya yumuşak bir geçiş için.',
    icon: 'moon',
    color: colors.primary,
    pattern: patterns.relax446,
    durations: [5, 10, 15],
    durationLabels: { 5: 'Kısa & Hafif', 10: 'Dengeli', 15: 'Derin Rahatlama' },
  },
  {
    id: 'stresi-azalt',
    title: 'Stresi Azalt',
    playerTitle: 'Stresi Azalt',
    description: 'Kutu nefesi gerginliği düşürür, sinir sistemini dengeler.',
    icon: 'leaf',
    color: colors.teal,
    pattern: patterns.box4444,
    durations: [5, 10, 15, 20],
  },
  {
    id: 'zihnini-sakinlestir',
    title: 'Zihnini Sakinleştir',
    playerTitle: 'Zihnini Sakinleştir',
    description: 'Uzun nefes verişler düşünce akışını yavaşlatır, zihni toparlar.',
    icon: 'cloud',
    color: colors.sky,
    pattern: patterns.calm46,
    durations: [5, 10, 15],
  },
  {
    id: 'derin-uyku',
    title: 'Derin Uykuya Hazırlık',
    playerTitle: 'Derin Uykuya Hazırlık',
    description: '4-7-8 tekniği vücudu derin dinlenmeye hazırlar.',
    icon: 'cloudy-night',
    color: colors.violet,
    pattern: patterns.sleep478,
    durations: [10, 15, 20],
  },
  {
    id: 'sabah-enerjisi',
    title: 'Sabah Enerjisi',
    playerTitle: 'Sabah Enerjisi',
    description: 'Ritmik nefesle güne zinde ve net bir zihinle başla.',
    icon: 'sunny',
    color: colors.amber,
    pattern: patterns.energy44,
    durations: [5, 10],
  },
  {
    id: 'odaklan',
    title: 'Odaklan & Konsantre Ol',
    playerTitle: 'Odaklan & Konsantre Ol',
    description: 'Eşit ritimli nefes dikkatini toplar, odağını keskinleştirir.',
    icon: 'disc',
    color: colors.coral,
    pattern: patterns.focus55,
    durations: [5, 10, 15],
  },
];

export const exerciseById = (id: string | undefined) =>
  exercises.find((e) => e.id === id);

export const flagshipExercise = exercises[0];

/** "4-15 dk" style range label */
export function durationRangeLabel(e: Exercise): string {
  const min = Math.min(...e.durations);
  const max = Math.max(...e.durations);
  return `${min}-${max} dk`;
}
