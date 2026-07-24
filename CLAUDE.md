@AGENTS.md

# Hälsa Breathe — Proje Kuralları

Nefes egzersizi ve uyku müziği uygulaması. Expo SDK 54 + expo-router + TypeScript + Zustand + Reanimated 4. Koyu tema, Inter fontu, sakin/ferah tasarım dili.

## Görsel değişikliklerde zorunlu adım

`app/` veya `components/` altında görünümü etkileyen HER değişiklikten önce
`.claude/skills/ui-audit/SKILL.md` dosyasını oku ve kurallarına uy.
Kısa özet (detay skill'de):

- Başlık deseni: detay ekranlarında üst barda sadece geri oku; büyük başlık (`type.h2`, sola yaslı) barın altında. Tab köklerinde `type.h2` + `type.caption`. El yapımı başlık satırı yasak.
- Ana sayfa scroll etmez (`<Screen scroll={false}>`); içerik 640dp yüksekliğe esnek düzenle sığar.
- Tüm boşluklar `spacing(n)`, tüm yazılar `type.*`, tüm köşeler `radii.*` — ekran dosyasında sihirli sayı yasak.
- Dokunma hedefleri efektif 44×44 (görsel + hitSlop).
- Ekran boyutu `useWindowDimensions` ile okunur; `height < 700` kompakt mod, `width > 600` içerik `maxWidth: 480` ortalanır.

## Mimari notlar

- Ekran sarmalayıcısı: `components/ui/Screen.tsx` (safe-area, scroll, yatay padding, gradient). Ekranlar kendi safe-area/padding'ini yönetmez.
- Ortak UI kiti: `components/ui/` (Card, Header, Button, Chip, ListRow, SegmentedTabs, IconBadge). Yeni desen gerekiyorsa önce buraya bileşen ekle, ekranda inline çözme.
- Durum: `store/appStore.ts` (Zustand). Nefes motoru: `engine/useBreathingEngine.ts`.
- Bir düzeltme birden çok ekranı ilgilendiriyorsa ortak bileşende yap.

## Komutlar

- Geliştirme: `npx expo start`
- Lint: `npm run lint`
- APK build: `eas build -p android --profile preview`
