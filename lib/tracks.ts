import { Ionicons } from '@expo/vector-icons';
import { categoryLabel, soundById, sounds } from '@/data/sounds';
import { sleepTrackById, sleepTracks } from '@/data/sleepMusic';

export interface TrackInfo {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  tile: [string, string];
  file: number;
  /** "Doğa", "Beyaz Gürültü", "Enstrüman" veya "Uyku Müziği" */
  kindLabel: string;
  /** Ambient sounds are remembered as the breathing-session background */
  isAmbient: boolean;
}

/** Unified lookup across ambient sounds and sleep music */
export function trackById(id: string | undefined): TrackInfo | undefined {
  if (!id) return undefined;
  const sound = soundById(id);
  if (sound) {
    return {
      id: sound.id,
      title: sound.title,
      icon: sound.icon,
      tile: sound.tile,
      file: sound.file,
      kindLabel: categoryLabel(sound.category),
      isAmbient: true,
    };
  }
  const track = sleepTrackById(id);
  if (track) {
    return {
      id: track.id,
      title: track.title,
      icon: track.icon,
      tile: track.tile,
      file: track.file,
      kindLabel: 'Uyku Müziği',
      isAmbient: false,
    };
  }
  return undefined;
}

/** Ordered ids of the same kind as `id` — prev/next navigation stays within kind */
export function siblingTrackIds(id: string): string[] {
  if (soundById(id)) return sounds.map((s) => s.id);
  if (sleepTrackById(id)) return sleepTracks.map((t) => t.id);
  return [];
}
