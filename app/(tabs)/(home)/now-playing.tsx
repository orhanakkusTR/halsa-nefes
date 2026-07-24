import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

export default function NowPlayingScreen() {
  const router = useRouter();
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

  if (!track) {
    return (
      <Screen
        header={<Header title="Şimdi Çalıyor" leftIcon="back" variant="large" />}
        background={<ScreenBackground />}
      >
        <View style={styles.emptyWrap}>
          <Ionicons name="musical-notes-outline" size={44} color={colors.textMuted} />
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            Şu an çalan bir ses yok.{'\n'}Aşağıdan bir uyku müziği seçebilirsin.
          </Text>
          <View style={styles.grid}>
            {sleepTracks.map((t) => (
              <Pressable key={t.id} onPress={() => playAmbient(t.id)} style={styles.gridTile}>
                <LinearGradient colors={t.tile} style={styles.gridIcon}>
                  <Ionicons name={t.icon} size={22} color="rgba(255,255,255,0.9)" />
                </LinearGradient>
                <Text style={[type.label, styles.gridLabel]}>{t.shortTitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <Header
          title={track.isAmbient ? 'Şimdi Çalıyor' : 'Uyku Müziği'}
          leftIcon="back"
          right={
            <Pressable hitSlop={10} onPress={() => toggleFavorite(track.id)}>
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
      <View style={styles.body}>
        {/* Glowing circular artwork */}
        <View style={styles.artworkGlow}>
          <LinearGradient colors={track.tile} style={styles.artwork}>
            <Ionicons name={track.icon} size={72} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </View>

        <View style={{ alignItems: 'center', gap: spacing(1) }}>
          <Text style={type.h2}>{track.title}</Text>
          <Text style={type.caption}>{track.kindLabel}</Text>
        </View>

        {/* Transport controls */}
        <View style={styles.controls}>
          <Pressable hitSlop={10} onPress={() => setLoopEnabled(!loopEnabled)}>
            <Ionicons
              name="repeat"
              size={22}
              color={loopEnabled ? colors.primary : colors.textMuted}
            />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => skip(-1)}>
            <Ionicons name="play-skip-back" size={26} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.playBtn}
            onPress={() => (nowPlaying?.playing ? pauseAmbient() : resumeAmbient())}
          >
            <Ionicons name={nowPlaying?.playing ? 'pause' : 'play'} size={30} color="#10142E" />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => skip(1)}>
            <Ionicons name="play-skip-forward" size={26} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => setTimerOpen((o) => !o)}>
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
            style={{ flex: 1, height: 40 }}
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

        {/* Sleep timer */}
        <Pressable style={styles.timerCard} onPress={() => setTimerOpen((o) => !o)}>
          <View style={styles.timerIcon}>
            <Ionicons name="moon" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Uyku Zamanlayıcı</Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              {sleepTimer
                ? `${remainingMin} dakika sonra duracak`
                : 'Müzik otomatik durmasın'}
            </Text>
          </View>
          <Text style={[type.labelStrong, styles.timerValue]}>{sleepTimer ? `${sleepTimer.minutes} dk` : 'Kapalı'}</Text>
          <Ionicons
            name={timerOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
        {timerOpen ? (
          <View style={styles.timerOptions}>
            <Pressable
              onPress={() => {
                setSleepTimer(null);
                setTimerOpen(false);
              }}
              style={[styles.timerChip, !sleepTimer && styles.timerChipActive]}
            >
              <Text style={[type.label, styles.timerChipText, !sleepTimer && styles.timerChipTextActive]}>
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
                  <Text style={[type.label, styles.timerChipText, active && styles.timerChipTextActive]}>
                    {m} dk
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* Sleep music quick-switch */}
        <View style={styles.gridHeader}>
          <Text style={type.title}>Uyku Müzikleri</Text>
          <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/(home)/sleep-music')}>
            <Text style={[type.label, styles.seeAll]}>Hepsini Gör</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {sleepTracks.map((t) => {
            const active = track.id === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => playAmbient(t.id)}
                style={[styles.gridTile, active && styles.gridTileActive]}
              >
                <LinearGradient colors={t.tile} style={styles.gridIcon}>
                  <Ionicons name={t.icon} size={22} color="rgba(255,255,255,0.9)" />
                </LinearGradient>
                <Text style={[type.label, styles.gridLabel, active && { color: colors.text }]}>
                  {t.shortTitle}
                </Text>
                <Text style={[type.micro, styles.gridDuration]}>{formatTrackDuration(t.durationSec)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    alignItems: 'center',
    gap: spacing(4),
    marginTop: spacing(10),
  },
  body: {
    alignItems: 'center',
    gap: spacing(5),
  },
  artworkGlow: {
    borderRadius: 120,
    shadowColor: '#8B95F6',
    shadowOpacity: 0.45,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
    marginTop: spacing(2),
  },
  artwork: {
    width: 216,
    height: 216,
    borderRadius: 108,
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
    width: 72,
    height: 72,
    borderRadius: 36,
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
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    alignSelf: 'stretch',
    backgroundColor: 'rgba(23,40,57,0.80)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3.5),
  },
  timerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    color: colors.text,
  },
  timerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    alignSelf: 'stretch',
    marginTop: -spacing(2),
  },
  timerChip: {
    paddingHorizontal: spacing(3.5),
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
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  seeAll: {
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing(3),
    alignSelf: 'stretch',
  },
  gridTile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: 'rgba(23,40,57,0.72)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(2),
  },
  gridTileActive: {
    borderColor: 'rgba(139,149,246,0.6)',
    backgroundColor: colors.primarySoft,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gridDuration: {
    color: colors.textMuted,
  },
});
