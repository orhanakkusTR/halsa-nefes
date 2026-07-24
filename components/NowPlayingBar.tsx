import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { pauseAmbient, resumeAmbient, stopAmbient } from '@/lib/audio';
import { trackById } from '@/lib/tracks';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, radii, spacing } from '@/theme';

/** Compact now-playing pill that slides in at the top of Home while audio is active */
export function NowPlayingBar() {
  const router = useRouter();
  const nowPlaying = useAppStore((s) => s.nowPlaying);
  const track = trackById(nowPlaying?.soundId);

  if (!track) return null;

  return (
    <Animated.View
      entering={SlideInUp.duration(350)}
      exiting={SlideOutUp.duration(250)}
      style={styles.bar}
    >
      <Pressable style={styles.body} onPress={() => router.push('/(tabs)/(home)/now-playing')}>
        <LinearGradient colors={track.tile} style={styles.tile}>
          <Ionicons name={track.icon} size={13} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
      </Pressable>
      <Pressable
        hitSlop={8}
        onPress={() => (nowPlaying?.playing ? pauseAmbient() : resumeAmbient())}
      >
        <Ionicons
          name={nowPlaying?.playing ? 'pause-circle' : 'play-circle'}
          size={28}
          color={colors.primary}
        />
      </Pressable>
      <Pressable hitSlop={8} onPress={stopAmbient}>
        <Ionicons name="close-circle-outline" size={24} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: 'rgba(13,21,38,0.88)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(139,149,246,0.28)',
    paddingVertical: spacing(1.5),
    paddingLeft: spacing(1.5),
    paddingRight: spacing(2.5),
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    minWidth: 0,
  },
  tile: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
});
