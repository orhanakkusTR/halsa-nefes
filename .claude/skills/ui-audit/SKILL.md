---
name: ui-audit
description: Hälsa Breathe uygulamasının UI/UX standartlarını tanımlar ve ekranları bu standartlara göre denetler. Kullanıcı ekran tasarımı, başlık/header, boşluk/spacing, yazı boyutu, responsive davranış, küçük ekran uyumu, tablet görünümü, dokunma hedefi, scroll davranışı veya "ekranı düzelt / güzelleştir / denetle / UI / UX / tasarım" gibi herhangi bir görsel-düzen konusundan bahsettiğinde MUTLAKA bu skill'i kullan. Yeni ekran veya bileşen oluştururken de bu kurallara uy. app/ veya components/ altında .tsx dosyasına dokunan her görsel değişiklikte önce bu skill okunmalı.
---

# Hälsa Breathe — UI/UX Denetim ve Tasarım Standartları

Bu skill iki amaçla kullanılır:
1. **Denetim:** Mevcut ekranları aşağıdaki kurallara göre tara, ihlalleri listele, düzeltme planı çıkar.
2. **Üretim:** Yeni ekran/bileşen yazarken bu kurallara baştan uy.

## 0. Temel ilkeler

- Tasarım dili: sakin, karanlık, nefes alan (Calm/Headspace ruhu). Sıkışıklık = hata.
- Tüm görsel değerler `@/theme`'den gelir. Ekran dosyalarında sihirli sayı yasak.
- Değişiklik yapmadan önce ilgili ekranı VE kullandığı ortak bileşenleri oku.
- Bir kural birden çok ekranı etkiliyorsa düzeltme ortak bileşende yapılır, ekranlarda değil.

## 1. Başlık (Header) standardı — "büyük başlık" deseni

Uygulamada TEK başlık deseni vardır:

**Detay/push ekranları** (`Header` bileşeni kullananlar):
- Üst barda YALNIZCA geri oku (ve varsa sağ aksiyon) bulunur. Barda başlık metni YOKTUR.
- Asıl başlık, barın altında içerik akışında yer alır: `type.h2` (22px), sola yaslı.
- `Header` bileşeni `variant: 'large'` destekler; detay ekranları bunu kullanır.
- Üst bar boşluğu: `insets.top + spacing(4)` (status bara yapışmaz).
- Başlık ile içerik arası: `spacing(5)`.

**Tab kökü ekranları** (exercises, profile, progress, home):
- Header bileşeni yok; ekranın en üstünde `type.h2` sola yaslı başlık + altında `type.caption` alt açıklama.
- Progress ekranındaki gibi ortalanmış/el yapımı başlık satırı YASAKTIR — varsa bu desene dönüştürülür.
- Sağ üst aksiyon gerekiyorsa başlıkla aynı satırda, sağa yaslı ikon butonu olarak durur.

**Ana sayfa (home/index)** istisnadır: hero + logo tasarımı korunur, ancak `insets.top + spacing(3)` altına inilmez.

Denetimde ara: `<Header` kullanımı `title` prop'u ile bar içinde başlık gösteriyorsa → ihlal. `headerRow`, `textAlign: 'center'` ile el yapımı başlık → ihlal.

## 2. Scroll davranışı

- **Ana sayfa (app/(tabs)/(home)/index.tsx): scroll YOK.** `<Screen scroll={false}>` kullanılır.
  - İçerik esnek düzenle sığdırılır: hero `flex` ile esner (minHeight/maxHeight sınırlı), kart araları `useWindowDimensions` ile `height < 700` cihazlarda bir kademe daralır.
  - Hedef: 640dp kullanılabilir yükseklikte (küçük Android) hiçbir öğe kesilmez, taşmaz.
- Diğer ekranlar: içerik sığıyorsa `scroll={false}` tercih edilir; sığmıyorsa scroll serbest.
- Player ekranı asla scroll etmez; nefes halkası `useWindowDimensions` ile ölçeklenir (mevcut mantık korunur, `height - 430` gibi sihirli sayılar isimlendirilmiş sabitlere çekilir).

## 3. Tipografi

- Yazı stili SADECE `theme/typography.ts`'teki `type.*` ölçeğinden gelir.
- Ekran dosyasında elle `fontSize` / `lineHeight` / `fontFamily` yazmak YASAKTIR.
  - Denetimde ara: `grep -rn "fontSize:" app/ components/` — `theme/` dışındaki her sonuç ihlaldir.
  - Ölçekte karşılığı olmayan bir boyut gerekiyorsa önce `type`'a yeni bir stil eklenir (ör. `micro: 11px`), sonra kullanılır.
- Erişilebilirlik: metin bileşenlerinde `maxFontSizeMultiplier={1.3}` standarttır (sistem yazı büyütmesinde taşmayı önler). Ortak `Text` sarmalayıcısı varsa orada, yoksa `type` kullanımına en yakın ortak noktada uygulanır.

## 4. Boşluk ve köşe yarıçapı

- Tüm padding/margin/gap değerleri `spacing(n)` ile yazılır (4px grid). Elle `padding: 12` yasak; `padding: spacing(3)` doğru.
- Köşeler `radii` sabitlerinden gelir.
- Ekranların yatay içerik dolgusu `Screen` bileşeninden gelir (`spacing(5)`); ekran içinde tekrar yatay padding verilmez.

## 5. Dokunma hedefleri

- Basılabilir her öğenin efektif dokunma alanı en az **44×44** olmalıdır.
- Görsel boyut küçükse (36×36 ikon butonu gibi) `hitSlop` ile 44'e tamamlanır: görsel 36 → `hitSlop={4}` yetmez, en az `hitSlop={8}` gerekir. Kural: `görsel + 2×hitSlop ≥ 44`.
- Denetimde ara: `Pressable`/`TouchableOpacity` içeren, `width/height < 44` olup yeterli `hitSlop`'u olmayan her öğe → ihlal.

## 6. Responsive ve cihaz uyumu

- Ekrana bağlı boyutlar `useWindowDimensions` ile hesaplanır; `Dimensions.get` kullanılmaz (döndürme/split-screen'de güncellenmez).
- **Küçük ekran eşiği:** `height < 700` → kompakt mod (daraltılmış gap'ler, küçülen hero/disk).
- **Tablet/geniş ekran:** `width > 600` → içerik `maxWidth: 480` ile ortalanır. Bu kural `Screen` bileşenine bir kez eklenir, tüm ekranlara yayılır.
- now-playing'deki 216px disk gibi büyük sabit görseller: `Math.min(sabit, width - spacing(10)*2)` desenine çevrilir.
- `edgeToEdgeEnabled: true` olduğundan alt boşluklar her zaman `insets.bottom` içermelidir (Screen bunu yapıyor; ekranların kendi alt sabit öğeleri varsa kontrol et).

## 7. Denetim prosedürü

"Ekranları denetle" istendiğinde şu sırayla ilerle:

1. `theme/` klasörünü oku (güncel ölçekleri öğren).
2. Hedef ekran(lar)ı ve kullandıkları ortak bileşenleri oku.
3. Her ekran için kural 1-6'yı kontrol et; ihlalleri `dosya:satır — kural — öneri` formatında tablola.
4. Düzeltmeleri şu öncelikle planla: (a) ortak bileşende çözülebilenler, (b) tema sistemine eklenecekler, (c) ekran-özel düzeltmeler.
5. Planı kullanıcıya onaylat, sonra uygula.
6. Uygulama sonrası doğrulama: aynı grep denetimlerini tekrar çalıştır; `npx expo start` ile küçük ekran (360×640) ve normal ekran (390×844) önizlemesi öner.

## 8. Bilinen borçlar (ilk denetimde öncelikli)

- `Header` bileşenine `variant: 'large'` eklenmesi ve 12 detay ekranının geçirilmesi.
- `progress/index.tsx` el yapımı başlık satırının tab-kökü desenine çevrilmesi.
- Ana sayfanın `scroll={false}` + esnek düzene geçirilmesi.
- Ekranlara dağılmış ~15 elle yazılmış `fontSize` değerinin `type` ölçeğine taşınması.
- `player.tsx` içindeki `430` sihirli sayısının isimlendirilmesi.
- `Screen`'e tablet `maxWidth` desteği.
