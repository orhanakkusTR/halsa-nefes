import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BreathingRing, BreathingRingHandle } from '@/components/player/BreathingRing';
import { SoundCarousel } from '@/components/player/SoundCarousel';
import { Button } from '@/components/ui';
import { exerciseById, flagshipExercise } from '@/data/exercises';
import { pauseAmbient, playAmbient, resumeAmbient, setAmbientVolume, stopAmbient } from '@/lib/audio';
import { todayISO } from '@/lib/dates';
import { useBreathingEngine } from '@/engine/useBreathingEngine';
import { moodOfToday, useAppStore } from '@/store/appStore';
import { colors, fonts, spacing, type } from '@/theme';

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Fixed-layout screen: the ring scales down on short screens so header +
  // ring + volume + carousel always fit without any scrolling.
  const compact = height < 720;
  const ringSize = Math.round(
    Math.min(300, width - spacing(10) * 2, Math.max(180, height - 430))
  );
  const params = useLocalSearchParams<{
    exerciseId?: string;
    minutes?: string;
    journeyDay?: string;
  }>();

  const exercise = exerciseById(params.exerciseId) ?? flagshipExercise;
  const minutes = Number(params.minutes) || 10;
  const journeyDay = params.journeyDay ? Number(params.journeyDay) : undefined;

  const logSession = useAppStore((s) => s.logSession);
  const hapticsEnabled = useAppStore((s) => s.settings.hapticsEnabled);
  const moodLog = useAppStore((s) => s.moodLog);
  const volume = useAppStore((s) => s.settings.volume);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const nowPlaying = useAppStore((s) => s.nowPlaying);

  const ringRef = useRef<BreathingRingHandle>(null);
  const startedAtRef = useRef(Date.now());
  const loggedRef = useRef(false);
  const [finishedSec, setFinishedSec] = useState<number | null>(null);

  const buzz = useCallback(() => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [hapticsEnabled]);

  const engine = useBreathingEngine({
    pattern: exercise.pattern,
    minutes,
    onPhase: (e) => {
      ringRef.current?.phase(e);
      if (e.elapsedInPhaseMs === 0) buzz();
    },
    onPause: () => ringRef.current?.pause(),
    onComplete: (elapsedSec) => {
      writeLog(elapsedSec, true);
      setFinishedSec(elapsedSec);
      if (hapticsEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    },
  });

  const engineRef = useRef(engine);
  engineRef.current = engine;

  // Keep the screen on during the session (web wake-lock may be denied — ignore)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const tag = 'breathing-session';
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, []);

  const writeLog = useCallback(
    (secondsCompleted: number, natural: boolean) => {
      if (loggedRef.current) return;
      if (!natural && secondsCompleted < 30) return; // ignore accidental opens
      loggedRef.current = true;
      const planned = minutes * 60;
      const e = engineRef.current;
      logSession({
        dateISO: todayISO(),
        startedAt: startedAtRef.current,
        exerciseId: exercise.id,
        minutesPlanned: minutes,
        secondsCompleted,
        cyclesCompleted: natural ? e.cyclesPlanned : Math.max(0, e.cycle - 1),
        cyclesPlanned: e.cyclesPlanned,
        completed: natural || secondsCompleted >= planned * 0.8,
        journeyDay,
        moodBefore: moodOfToday(moodLog),
      });
    },
    [exercise.id, journeyDay, logSession, minutes, moodLog]
  );

  // Auto-start once on mount; start ambient loop if configured
  useEffect(() => {
    startedAtRef.current = Date.now();
    engineRef.current.start();
    const { soundEnabled, lastSoundId } = useAppStore.getState().settings;
    if (soundEnabled && lastSoundId) playAmbient(lastSoundId);
    return () => {
      const secs = engineRef.current.stop();
      writeLog(secs, false);
      stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The session has no manual pause control: auto-pause in background,
  // auto-resume when the app becomes active again.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && engineRef.current.status === 'running') {
        engineRef.current.pause();
        pauseAmbient();
      } else if (state === 'active' && engineRef.current.status === 'paused') {
        engineRef.current.resume();
        resumeAmbient();
      }
    });
    return () => sub.remove();
  }, []);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.navigate('/');
  };

  const phase = exercise.pattern.phases[engine.phaseIndex];
  const finished = engine.status === 'finished';

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Image
        source={require('@/assets/images/player-bg.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={400}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(11,18,32,0.55)', 'rgba(11,18,32,0.15)', 'rgba(11,18,32,0.55)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: insets.top + spacing(4) }]}>
        <Pressable onPress={close} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[type.title, styles.headerTitle]} numberOfLines={1}>
          {exercise.playerTitle}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={[styles.body, compact && { gap: spacing(4) }]}>
        {finished ? (
          <View style={styles.doneWrap}>
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark" size={44} color={colors.teal} />
            </View>
            <Text style={type.h2}>Tamamlandı</Text>
            <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              {Math.round((finishedSec ?? minutes * 60) / 60)} dakikalık nefes pratiğini bitirdin.
              {'\n'}İyi uykular. 🌙
            </Text>
          </View>
        ) : (
          <>
            <BreathingRing ref={ringRef} pattern={exercise.pattern} size={ringSize}>
              <Text style={type.phaseLabel}>{phase.label}</Text>
              <Text style={styles.countdown}>{engine.secondsLeft} sn</Text>
            </BreathingRing>
            <Text style={styles.cycles}>
              {engine.cycle} / {engine.cyclesPlanned} Döngü
            </Text>
          </>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing(6) }]}>
        {finished ? (
          <Button label="Kapat" onPress={close} style={{ alignSelf: 'stretch' }} />
        ) : (
          <>
            {nowPlaying?.soundId ? (
              <View style={styles.volumeRow}>
                <Ionicons name="volume-low" size={18} color={colors.textSecondary} />
                <Slider
                  style={{ flex: 1, height: 32 }}
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
                <Ionicons name="volume-high" size={18} color={colors.textSecondary} />
              </View>
            ) : null}
            <View style={styles.carouselFull}>
              <SoundCarousel />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(8),
    paddingHorizontal: spacing(5),
  },
  countdown: {
    fontFamily: fonts.medium,
    fontSize: 19,
    color: colors.textSecondary,
    marginTop: spacing(1),
  },
  cycles: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing(5),
    gap: spacing(3),
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2.5),
    alignSelf: 'stretch',
    paddingHorizontal: spacing(4),
  },
  // Bleed past the footer padding so carousel items run to the true screen edge
  carouselFull: {
    alignSelf: 'stretch',
    marginHorizontal: -spacing(5),
  },
  doneWrap: { alignItems: 'center', gap: spacing(3) },
  doneBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(90,214,190,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
});
