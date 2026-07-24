import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

export type SoundCategory = 'doga' | 'beyazGurultu' | 'enstruman';

export interface Sound {
  id: string;
  title: string;
  category: SoundCategory;
  icon: keyof typeof Ionicons.glyphMap;
  /** Gradient tile colors (photo thumbnails in the mockup are recreated as gradients) */
  tile: [string, string];
  /** Bundled loop asset (Metro module id) */
  file: number;
}

export const soundCategories: { value: SoundCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'doga', label: 'Doğa' },
  { value: 'beyazGurultu', label: 'Beyaz Gürültü' },
  { value: 'enstruman', label: 'Enstrüman' },
];

export const sounds: Sound[] = [
  { id: 'yagmur', title: 'Yağmur', category: 'doga', icon: 'rainy', tile: ['#2A3B66', '#141D3A'], file: require('@/assets/sounds/yagmur.mp3') },
  { id: 'dalga', title: 'Dalga Sesi', category: 'doga', icon: 'water', tile: ['#1E4A63', '#102338'], file: require('@/assets/sounds/dalga.mp3') },
  { id: 'orman', title: 'Orman', category: 'doga', icon: 'leaf', tile: ['#1F4A3C', '#0F2420'], file: require('@/assets/sounds/orman.mp3') },
  { id: 'doga-sesleri', title: 'Doğa Sesleri', category: 'doga', icon: 'flower', tile: ['#2E4A2E', '#13230F'], file: require('@/assets/sounds/doga-sesleri.mp3') },
  { id: 'kamp-atesi', title: 'Kamp Ateşi', category: 'doga', icon: 'flame', tile: ['#66351E', '#2A1510'], file: require('@/assets/sounds/kamp-atesi.mp3') },
  { id: 'beyaz-gurultu', title: 'Beyaz Gürültü', category: 'beyazGurultu', icon: 'radio', tile: ['#3A4152', '#1B2029'], file: require('@/assets/sounds/beyaz-gurultu.mp3') },
  { id: 'pembe-gurultu', title: 'Pembe Gürültü', category: 'beyazGurultu', icon: 'pulse', tile: ['#5C3550', '#251522'], file: require('@/assets/sounds/pembe-gurultu.mp3') },
  { id: 'piyano', title: 'Piyano', category: 'enstruman', icon: 'musical-notes', tile: ['#2F2F52', '#15152A'], file: require('@/assets/sounds/piyano.mp3') },
  { id: 'enstrumantal', title: 'Enstrümantal', category: 'enstruman', icon: 'musical-note', tile: ['#3A2F5C', '#191329'], file: require('@/assets/sounds/enstrumantal.mp3') },
];

export const soundById = (id: string | undefined) => sounds.find((s) => s.id === id);

export const categoryLabel = (c: SoundCategory) =>
  soundCategories.find((x) => x.value === c)?.label ?? '';

// Placeholder while audio files land in M6; colors reused by tiles/icons
export const soundAccent: Record<SoundCategory, string> = {
  doga: colors.teal,
  beyazGurultu: colors.textSecondary,
  enstruman: colors.violet,
};
