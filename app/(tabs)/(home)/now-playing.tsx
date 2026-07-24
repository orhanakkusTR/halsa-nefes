import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Header, Screen } from '@/components/ui';
import { formatTrackDuration, sleepTracks } from '@/data/sleepMusic';
import {
  pauseAmbient,
  playAmbient,
  resumeAmbient,
  setAmbientVolume,
  setLoopEnabled,
  setSleepTimer,
} from '@/lib/audio';
import { siblingTrackIds, trackById } from '@/lib/tracks';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

const TIMER_OPTIONS = [15, 30, 45, 60] as const;
// Sabit (scroll'suz) düzen: disk küçük ekranda daralır, kartlar sıkışır
const COMPACT_HEIGHT = 700;
const ARTWORK_MAX = 216;
const ARTWORK_COMPACT = 100;
const PLAY_BTN = 72;
const PLAY_BTN_COMPACT = 56;
const STRIP_GAP = spacing(3);

function ScreenBackground() {
  return (
    <>
      <Image
        source={require('@/assets/images/now-playing-bg.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['rgba(11,18,32,0.30)', 'rgba(11,18,32,0.08)', 'rgba(11,18,32,0.42)']}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

/** Uyku müzikleri: 3'ü görünür, sağa-sola kaydırmalı, ekran kenarına taşar */
function TrackStrip({ activeId, compact }: { activeId?: string; compact: boolean }) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  // İçerik alanına (yatay dolgular çıkınca) tam 3 karo sığar; 4.sü kenardan görünür
  const tileW = Math.floor((width - spacing(5) * 2 - STRIP_GAP * 2) / 3);
  const step = tileW + STRIP_GAP;

  useEffect(() => {
    if (!activeId) return;
    const idx = sleepTracks.findIndex((t) => t.id === activeId);
    if (idx < 1) return;
    const t = setTimeout(
      () => scrollRef.current?.scrollTo({ x: (idx - 1) * step, animated: false }),
      50
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      style={styles.stripBleed}
      contentContainerStyle={styles.strip}
    >
      {sleepTracks.map((t) => {
        const active = t.id === activeId;
        return (
          <Pressable
            key={t.id}
            onPress={() => playAmbient(t.id)}
            style={[
              styles.tile,
              { width: tileW },
              compact && styles.tileCompact,
              active && styles.tileActive,
            ]}
          >
            <LinearGradient colors={t.tile} style={styles.tileIcon}>
              <Ionicons name={t.icon} size={22} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
            <Text
              style={[type.label, styles.tileLabel, active && { color: colors.text }]}
              numberOfLines={1}
            >
              {t.shortTitle}
            </Text>
            <Text style={[type.micro, styles.tileDuration]}>
              {formatTrackDuration(t.durationSec)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function NowPlayingScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const compact = height < COMPACT_HEIGHT;
  const nowPlaying = useAppStore((s) => s.nowPlaying);
  const volume = useAppStore((s) => s.settings.volume);
  const favorites = useAppStore((s) => s.favoriteSoundIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavoriteSound);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const loopEnabled = useAppStore((s) => s.loopEnabled);
  const sleepTimer = useAppStore((s) => s.sleepTimer);

  const [timerOpen, setTimerOpen] = useState(false);
  const [, forceTick] = useState(0);

  const track = trackById(nowPlaying?.soundId);
  const fav = track ? favorites.includes(track.id) : false;

  // Refresh the remaining-minutes label periodically while a timer runs
  useEffect(() => {
    if (!sleepTimer) return;
    const t = setInterval(() => forceTick((x) => x + 1), 20_000);
    return () => clearInterval(t);
  }, [sleepTimer]);

  const skip = (dir: 1 | -1) => {
    if (!track) return;
    const ids = siblingTrackIds(track.id);
    if (ids.length < 2) return;
    const idx = ids.indexOf(track.id);
    const next = ids[(idx + dir + ids.length) % ids.length];
    playAmbient(next);
  };

  const remainingMin = sleepTimer
    ? Math.max(1, Math.ceil((sleepTimer.endsAt - Date.now()) / 60_000))
    : null;

  const artworkSize = compact ? ARTWORK_COMPACT : ARTWORK_MAX;
  const playSize = compact ? PLAY_BTN_COMPACT : PLAY_BTN;

  if (!track) {
    return (
      <Screen
        scroll={false}
        header={<Header title="Şimdi Çalıyor" leftIcon="back" variant="large" />}
        background={<ScreenBackground />}
      >
        <View style={styles.emptyWrap}>
          <Ionicons name="musical-notes-outline" size={44} color={colors.textMuted} />
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            Şu an çalan bir ses yok.{'\n'}Aşağıdan bir uyku müziği seçebilirsin.
          </Text>
          <TrackStrip compact={compact} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll={false}
      header={
        <Header
          title={track.isAmbient ? 'Şimdi Çalıyor' : 'Uyku Müziği'}
          leftIcon="back"
          right={
            <Pressable hitSlop={spacing(3)} onPress={() => toggleFavorite(track.id)}>
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={24}
                color={fav ? colors.coral : colors.textSecondary}
              />
            </Pressable>
          }
        />
      }
      background={<ScreenBackground />}
    >
      <View style={[styles.body, compact && styles.bodyCompact]}>
        {/* Glowing circular artwork — kalan alanı esnek doldurur */}
        <View style={[styles.artworkArea, compact && styles.artworkAreaCompact]}>
          <View style={styles.artworkGlow}>
            <LinearGradient
              colors={track.tile}
              style={[
                styles.artwork,
                { width: artworkSize, height: artworkSize, borderRadius: artworkSize / 2 },
              ]}
            >
              <Ionicons
                name={track.icon}
                size={compact ? 40 : 72}
                color="rgba(255,255,255,0.9)"
              />
            </LinearGradient>
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Text style={type.h2} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={type.caption}>{track.kindLabel}</Text>
        </View>

        {/* Transport controls */}
        <View style={styles.controls}>
          <Pressable hitSlop={spacing(3)} onPress={() => setLoopEnabled(!loopEnabled)}>
            <Ionicons
              name="repeat"
              size={22}
              color={loopEnabled ? colors.primary : colors.textMuted}
            />
          </Pressable>
          <Pressable hitSlop={spacing(3)} onPress={() => skip(-1)}>
            <Ionicons name="play-skip-back" size={26} color={colors.text} />
          </Pressable>
          <Pressable
            style={[
              styles.playBtn,
              { width: playSize, height: playSize, borderRadius: playSize / 2 },
            ]}
            onPress={() => (nowPlaying?.playing ? pauseAmbient() : resumeAmbient())}
          >
            <Ionicons name={nowPlaying?.playing ? 'pause' : 'play'} size={30} color="#10142E" />
          </Pressable>
          <Pressable hitSlop={spacing(3)} onPress={() => skip(1)}>
            <Ionicons name="play-skip-forward" size={26} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={spacing(3)} onPress={() => setTimerOpen((o) => !o)}>
            <Ionicons
              name="moon-outline"
              size={22}
              color={sleepTimer ? colors.primary : colors.textMuted}
            />
          </Pressable>
        </View>

        {/* Volume */}
        <View style={styles.volumeRow}>
          <Ionicons name="volume-low" size={20} color={colors.textSecondary} />
          <Slider
            style={[styles.volumeSlider, compact && styles.volumeSliderCompact]}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(139,149,246,0.25)"
            thumbTintColor={colors.primary}
            onValueChange={(v: number) => setAmbientVolume(v)}
            onSlidingComplete={(v: number) => {
              updateSettings({ volume: v });
              setAmbientVolume(v);
            }}
          />
          <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
        </View>

        {/* Sleep timer — seçenekler kartın içinde açılır, yükseklik sabit kalır */}
        <Pressable
          style={[styles.timerCard, compact && styles.timerCardCompact]}
          onPress={() => setTimerOpen((o) => !o)}
        >
          {timerOpen ? (
            <View style={styles.timerChips}>
              <Pressable
                onPress={() => {
                  setSleepTimer(null);
                  setTimerOpen(false);
                }}
                style={[styles.timerChip, !sleepTimer && styles.timerChipActive]}
              >
                <Text
                  style={[type.label, styles.timerChipText, !sleepTimer && styles.timerChipTextActive]}
                >
                  Kapalı
                </Text>
              </Pressable>
              {TIMER_OPTIONS.map((m) => {
                const active = sleepTimer?.minutes === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setSleepTimer(m);
                      setTimerOpen(false);
                    }}
                    style={[styles.timerChip, active && styles.timerChipActive]}
                  >
                    <Text
                      style={[type.label, styles.timerChipText, active && styles.timerChipTextActive]}
                    >
                      {m} dk
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <>
              <View style={styles.timerIcon}>
                <Ionicons name="moon" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.title}>Uyku Zamanlayıcı</Text>
                <Text style={[type.caption, styles.timerSub]}>
                  {sleepTimer
                    ? `${remainingMin} dakika sonra duracak`
                    : 'Müzik otomatik durmasın'}
                </Text>
              </View>
              <Text style={[type.labelStrong, styles.timerValue]}>
                {sleepTimer ? `${sleepTimer.minutes} dk` : 'Kapalı'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </>
          )}
        </Pressable>

        {/* Sleep music quick-switch: 3'lü kaydırmalı şerit */}
        {!compact && (
          <View style={styles.stripHeader}>
            <Text style={type.title}>Uyku Müzikleri</Text>
            <Pressable hitSlop={spacing(2)} onPress={() => router.push('/(tabs)/(home)/sleep-music')}>
              <Text style={[type.label, styles.seeAll]}>Hepsini Gör</Text>
            </Pressable>
          </View>
        )}
        <TrackStrip activeId={track.id} compact={compact} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(4),
  },
  body: {
    flex: 1,
    alignItems: 'center',
    gap: spacing(4),
  },
  bodyCompact: {
    gap: spacing(2),
  },
  artworkArea: {
    flexShrink: 1,
    justifyContent: 'center',
    paddingVertical: spacing(2),
  },
  artworkAreaCompact: {
    paddingVertical: 0,
  },
  artworkGlow: {
    borderRadius: ARTWORK_MAX / 2,
    shadowColor: '#8B95F6',
    shadowOpacity: 0.45,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  artwork: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,149,246,0.35)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: spacing(4),
  },
  playBtn: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    alignSelf: 'stretch',
    paddingHorizontal: spacing(2),
  },
  volumeSlider: {
    flex: 1,
    height: spacing(8),
  },
  volumeSliderCompact: {
    height: spacing(7),
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    alignSelf: 'stretch',
    backgroundColor: 'rgba(23,40,57,0.80)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3),
    minHeight: spacing(17),
  },
  timerCardCompact: {
    padding: spacing(2.5),
    minHeight: spacing(14),
  },
  timerIcon: {
    width: spacing(10),
    height: spacing(10),
    borderRadius: spacing(5),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSub: {
    marginTop: spacing(0.5),
  },
  timerValue: {
    color: colors.text,
  },
  timerChips: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  timerChip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(23,40,57,0.80)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timerChipText: {
    color: colors.textSecondary,
  },
  timerChipTextActive: {
    color: '#10142E',
  },
  stripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  seeAll: {
    color: colors.primary,
  },
  // Screen'in yatay dolgusunu taşarak şerit ekran kenarına akar
  stripBleed: {
    alignSelf: 'stretch',
    marginHorizontal: -spacing(5),
    flexGrow: 0,
  },
  strip: {
    gap: STRIP_GAP,
    paddingHorizontal: spacing(5),
  },
  tile: {
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: 'rgba(23,40,57,0.72)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(2),
  },
  tileCompact: {
    paddingVertical: spacing(2.5),
  },
  tileActive: {
    borderColor: 'rgba(139,149,246,0.6)',
    backgroundColor: colors.primarySoft,
  },
  tileIcon: {
    width: spacing(11),
    height: spacing(11),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tileDuration: {
    color: colors.textMuted,
  },
});
