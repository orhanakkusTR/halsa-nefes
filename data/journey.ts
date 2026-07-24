export interface JourneyDay {
  day: number; // 1..30
  exerciseId: string;
  minutes: number;
  reason: string;
}

// 30-day sleep journey: week 1 gentle 5', week 2 10', weeks 3-4 build to 15'.
export const journeyDays: JourneyDay[] = [
  { day: 1, exerciseId: 'uyumadan-once', minutes: 5, reason: 'İlk adım: kısa bir akşam rutiniyle nefesine alışmaya başlıyorsun.' },
  { day: 2, exerciseId: 'zihnini-sakinlestir', minutes: 10, reason: 'Uyumadan önce zihnini sakinleştirmek, daha hızlı uykuya dalmana yardımcı olur.' },
  { day: 3, exerciseId: 'uyumadan-once', minutes: 5, reason: 'Aynı saatte tekrar etmek, beynine "uyku vakti" sinyalini öğretir.' },
  { day: 4, exerciseId: 'stresi-azalt', minutes: 5, reason: 'Günün gerginliğini yatağa taşımamak için kutu nefesiyle ara ver.' },
  { day: 5, exerciseId: 'uyumadan-once', minutes: 10, reason: 'Süreyi biraz uzatıyoruz: 4-4-6 ritmi gevşemeyi derinleştirir.' },
  { day: 6, exerciseId: 'zihnini-sakinlestir', minutes: 5, reason: 'Kısa bir zihin temizliği, düşünce akışını yavaşlatır.' },
  { day: 7, exerciseId: 'derin-uyku', minutes: 10, reason: 'İlk haftayı 4-7-8 ile taçlandır: en derin rahatlama tekniğiyle tanış.' },
  { day: 8, exerciseId: 'uyumadan-once', minutes: 10, reason: 'İkinci hafta: rutinin artık 10 dakikaya çıkıyor.' },
  { day: 9, exerciseId: 'stresi-azalt', minutes: 10, reason: 'Stres birikimini akşamdan temizlemek uyku kalitesini yükseltir.' },
  { day: 10, exerciseId: 'zihnini-sakinlestir', minutes: 10, reason: 'Uzun nefes verişler kalp atışını yavaşlatır, bedeni uykuya hazırlar.' },
  { day: 11, exerciseId: 'uyumadan-once', minutes: 10, reason: 'Tutarlılık anahtardır: aynı ritim, daha kolay geçiş.' },
  { day: 12, exerciseId: 'derin-uyku', minutes: 10, reason: '4-7-8 pratiği derin uyku evrelerine geçişi destekler.' },
  { day: 13, exerciseId: 'sabah-enerjisi', minutes: 5, reason: 'Bugün farklı: sabah nefesiyle gün içi enerjini dengele.' },
  { day: 14, exerciseId: 'derin-uyku', minutes: 15, reason: 'İki haftayı bitiriyorsun — bu akşam kendine uzun bir rahatlama hediye et.' },
  { day: 15, exerciseId: 'uyumadan-once', minutes: 10, reason: 'Yolun yarısındasın! Rutinin artık bir alışkanlığa dönüşüyor.' },
  { day: 16, exerciseId: 'zihnini-sakinlestir', minutes: 15, reason: 'Daha uzun oturumlar zihinsel yorgunluğu daha derinden çözer.' },
  { day: 17, exerciseId: 'stresi-azalt', minutes: 10, reason: 'Kutu nefesi artık tanıdık: bugün ritmi hiç bozmadan akmayı dene.' },
  { day: 18, exerciseId: 'uyumadan-once', minutes: 15, reason: '15 dakikalık derin rahatlama, gece boyu daha az uyanma demek.' },
  { day: 19, exerciseId: 'derin-uyku', minutes: 15, reason: 'Derin uyku pratiğini uzatarak dinlenme kaliteni artırıyorsun.' },
  { day: 20, exerciseId: 'odaklan', minutes: 10, reason: 'Bugün odak nefesi: gündüz net bir zihin, gece rahat bir uyku getirir.' },
  { day: 21, exerciseId: 'uyumadan-once', minutes: 15, reason: 'Üç hafta oldu — beynin artık bu ritmi uyku ile eşleştiriyor.' },
  { day: 22, exerciseId: 'zihnini-sakinlestir', minutes: 15, reason: 'Zihni sakinleştirme artık daha hızlı çalışıyor; farkı hisset.' },
  { day: 23, exerciseId: 'stresi-azalt', minutes: 15, reason: 'Uzun kutu nefesi seansı, biriken haftalık stresi çözer.' },
  { day: 24, exerciseId: 'derin-uyku', minutes: 15, reason: '4-7-8 ustalaşıyor: nefes verişini iyice yavaşlatmayı dene.' },
  { day: 25, exerciseId: 'sabah-enerjisi', minutes: 10, reason: 'Sabah ritmi gün içi uyanıklığı, gece ise daha iyi uykuyu destekler.' },
  { day: 26, exerciseId: 'uyumadan-once', minutes: 15, reason: 'Akşam rutinin artık kendiliğinden geliyor — sadece nefesine bırak.' },
  { day: 27, exerciseId: 'zihnini-sakinlestir', minutes: 15, reason: 'Düşünceleri izleyip bırakmak, uykuya dalmanın en kısa yolu.' },
  { day: 28, exerciseId: 'derin-uyku', minutes: 20, reason: 'En uzun seansın: bedenini tam bir gevşemeye davet et.' },
  { day: 29, exerciseId: 'uyumadan-once', minutes: 15, reason: 'Son düzlük — rutinini koruyarak yarına hazırlan.' },
  { day: 30, exerciseId: 'derin-uyku', minutes: 20, reason: '30. gün! Bu yolculuğu tamamladın; bu ritim artık senin.' },
];

export const journeyDay = (day: number) => journeyDays.find((d) => d.day === day);

export const JOURNEY_LENGTH = journeyDays.length;
