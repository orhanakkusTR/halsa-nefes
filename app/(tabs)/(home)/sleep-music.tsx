import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Header, Screen } from '@/components/ui';
import { formatTrackDuration, sleepTracks } from '@/data/sleepMusic';
import { pauseAmbient, playAmbient, resumeAmbient } from '@/lib/audio';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

// Soft-black stage for sleep music. A custom background image will land here
// later — drop it in as an absolute <Image> under the gradient, player-bg style.
const SOFT_BLACK = '#0A0C11';

export default function SleepMusicScreen() {
  const router = useRouter();
  const nowPlaying = useAppStore((s) => s.nowPlaying);

  const toggle = (id: string) => {
    if (nowPlaying?.soundId === id) {
      if (nowPlaying.playing) pauseAmbient();
      else resumeAmbient();
    } else {
      playAmbient(id);
    }
  };

  return (
    <Screen
      header={<Header title="Uyku Müzikleri" leftIcon="back" variant="large" />}
      style={{ backgroundColor: SOFT_BLACK }}
      background={
        <LinearGradient colors={['#141828', '#0D101B', SOFT_BLACK]} style={StyleSheet.absoluteFill} />
      }
    >
      <Text style={[type.caption, styles.subtitle]}>
        Nefes egzersizi olmadan dinle; uykuya dalarken çalmaya devam eder.
      </Text>

      <View style={{ gap: spacing(3) }}>
        {sleepTracks.map((t) => {
          const isActive = nowPlaying?.soundId === t.id;
          const isPlaying = isActive && nowPlaying?.playing;
          return (
            <Pressable
              key={t.id}
              onPress={() => toggle(t.id)}
              style={[styles.trackCard, isActive && styles.trackCardActive]}
            >
              <LinearGradient colors={t.tile} style={styles.trackTile}>
                <Ionicons name={t.icon} size={26} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={type.title}>{t.title}</Text>
                <Text style={type.caption}>
                  {t.subtitle} · {formatTrackDuration(t.durationSec)}
                </Text>
              </View>
              <View style={[styles.playBadge, isPlaying && styles.playBadgeActive]}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color={isPlaying ? '#10142E' : colors.text}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {nowPlaying?.soundId ? (
        <Pressable
          style={styles.nowPlayingLink}
          onPress={() => router.push('/(tabs)/(home)/now-playing')}
        >
          <Ionicons name="musical-notes" size={14} color={colors.primary} />
          <Text style={[type.label, styles.nowPlayingText]}>Şimdi Çalıyor ekranını aç</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: spacing(5),
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3.5),
    backgroundColor: 'rgba(23,28,42,0.82)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(148,163,255,0.08)',
    padding: spacing(3.5),
  },
  trackCardActive: {
    borderColor: 'rgba(139,149,246,0.5)',
  },
  trackTile: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,149,246,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeActive: {
    backgroundColor: colors.primary,
  },
  nowPlayingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(1.5),
    marginTop: spacing(6),
    paddingVertical: spacing(2),
  },
  nowPlayingText: {
    color: colors.primary,
  },
});
