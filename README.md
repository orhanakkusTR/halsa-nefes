# Hälsa Breathe

Hälsa markası için uyku & nefes egzersizi mobil uygulaması. Expo (React Native) + TypeScript, **SDK 54**.

Tasarım kaynağı: `../app-mockup.jpg` (10 ekranlık mockup) · Logolar: `../logos/`

## Çalıştırma

```bash
npm install
npx expo start
```

- **Telefonda (asıl test):** Telefona App Store / Google Play'den **Expo Go** uygulamasını kur, bilgisayarla aynı Wi-Fi'dayken terminaldeki QR kodu okut. QR çalışmazsa `npx expo start --tunnel`.
- **Tarayıcıda (hızlı önizleme):** `npx expo start` çalışırken `w` tuşu. (Bildirim, haptik ve sessiz-anahtar davranışı web'de çalışmaz.)

> Not: Proje SDK 54'e sabitlendi çünkü mağazadaki Expo Go şu an yalnızca SDK 54 çalıştırıyor (Tem 2026). Expo Go güncellenince `npx expo install expo@^57 --fix` ile yükseltilebilir.

## Yapı

```
app/            expo-router rotaları (4 sekme + modallar)
components/     UI primitifleri, nefes halkası, grafikler, gece göğü sahnesi
data/           Egzersiz kataloğu, sesler, 30 günlük journey, rozetler, ruh halleri
engine/         Nefes state machine (faz/döngü/pause — Date.now tabanlı, drift'siz)
lib/            stats (saf fonksiyonlar + testler), audio singleton, bildirimler, tarih yardımcıları
store/          zustand store + AsyncStorage kalıcılığı (elle yazılmış, SSR-güvenli)
theme/          Renk/tipografi/spacing token'ları (mockup'tan örneklendi)
assets/sounds/  9 ambiyans kaydı (proje sahibinin sağladığı WAV'lardan dönüştürüldü, CREDITS.md)
assets/music/   3 uyku müziği (bağımsız çalma; ana sayfadaki "Uyku Müzikleri" ekranı)
                Şimdi Çalıyor: mockup bazlı tasarım — parça değiştirme, tekrar, ses,
                uyku zamanlayıcı (15/30/45/60 dk otomatik durdurma), kısa isimli müzik
                kutucukları; müzik çalarken ana sayfada mini oynatıcı barı görünür
```

## Ekibe APK dağıtımı (EAS Build)

Yapılandırma hazır (`eas.json` preview profili APK üretir; paket adı `com.halsa.breathe`).

```bash
npx eas-cli login          # expo.dev hesabıyla bir kez
npx eas-cli build -p android --profile preview
```

Derleme Expo'nun bulutunda ~10-20 dk sürer; bitince verilen linkten .apk indirilir.
Bu linki ekibe gönderin — Android'de "bilinmeyen kaynaklara izin ver" ile kurulur.
Yeni sürümde aynı komut yeter (app.json `versionCode` artırılmalı).

## Testler & kontroller

```bash
node --test lib/stats.test.ts   # seri/tarih/istatistik matematiği (14 test)
npx tsc --noEmit                # tip kontrolü
npx expo lint                   # lint
```

## Bilinçli v1 sınırları

- Sağlık Uygulamaları (HealthKit/Health Connect) → "Yakında" (native modül, dev build ister)
- Arka planda / kilit ekranında ses → v1'de yok; uygulama arka plana geçince seans duraklar, dönünce kaldığı yerden sürer
- Nefes seansında duraklat/oynat kontrolü bilinçli olarak yok; ses seçimi ekran içi kaydırmalı karuselden yapılır
- Veriler yalnızca cihazda (hesap yok); "Verileri Sıfırla" Profil'de

## Güncellemeleri ekibe ulaştırma (EAS Update — OTA)

Uygulama havadan güncellemeye hazır. Akış:

1. **Bir kez:** Bu yapılandırmadan SONRA bir APK derleyip ekibe dağıtın
   (`npx eas-cli build -p android --profile preview`). Bu APK güncelleyiciyi içerir.
2. **Her kod/içerik değişikliğinde:**
   ```bash
   npx eas-cli update --branch preview --message "değişiklik özeti"
   ```
   Telefonlardaki uygulama sonraki açılışta güncellemeyi indirir; ikinci
   açılışta yeni sürüm çalışır. Yeniden kurulum gerekmez.
3. **Yeni APK ne zaman şart?** Yalnızca native değişikliklerde: SDK yükseltme,
   yeni native modül, ikon/isim/izin değişikliği. (`versionCode` artırılıp
   yeniden build alınır; OTA güncellemeler aynı `version` (1.0.0) için geçerlidir.)
