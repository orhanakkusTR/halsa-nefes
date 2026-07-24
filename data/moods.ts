import type { MoodId } from '@/lib/model';

export interface MoodOption {
  id: MoodId;
  emoji: string;
  title: string;
  subtitle: string;
}

export const moods: MoodOption[] = [
  { id: 'calm', emoji: '🙂', title: 'Rahatım', subtitle: 'Huzurlu ve iyiyim' },
  { id: 'stressed', emoji: '😕', title: 'Biraz stresliyim', subtitle: 'Biraz gerginim' },
  { id: 'veryStressed', emoji: '😣', title: 'Çok stresliyim', subtitle: 'Zihnim çok meşgul' },
  { id: 'tired', emoji: '😪', title: 'Çok yorgunum', subtitle: 'Kendimi bitkin hissediyorum' },
];

/** Mood → recommended exercise; calm depends on time of day */
export function recommendedExerciseId(mood: MoodId, hour: number): string {
  switch (mood) {
    case 'stressed':
      return 'stresi-azalt';
    case 'veryStressed':
      return 'derin-uyku';
    case 'tired':
      return 'derin-uyku';
    case 'calm':
      return hour < 12 ? 'sabah-enerjisi' : 'zihnini-sakinlestir';
  }
}

/** Short "why" copy shown with the recommendation */
export function recommendationReason(mood: MoodId): string {
  switch (mood) {
    case 'stressed':
      return 'Kutu nefesi gerginliği hızla düşürür ve seni dengeye getirir.';
    case 'veryStressed':
      return '4-7-8 tekniği yoğun stresi yatıştırır, zihnini yavaşlatır.';
    case 'tired':
      return 'Derin ve uzun nefesler bedenini dinlenmeye hazırlar.';
    case 'calm':
      return 'Bu ritim iyi hissini korumana ve zihnini net tutmana yardımcı olur.';
  }
}
