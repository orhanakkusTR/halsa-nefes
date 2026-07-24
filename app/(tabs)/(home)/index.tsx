import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HalsaLogo } from '@/components/HalsaLogo';
import { JourneyIcon } from '@/components/JourneyIcon';
import { NowPlayingBar } from '@/components/NowPlayingBar';
import { DurationPicker } from '@/components/home/DurationPicker';
import { Button, Card, IconBadge, Screen } from '@/components/ui';
import { flagshipExercise } from '@/data/exercises';
import { journeyDay, JOURNEY_LENGTH } from '@/data/journey';
import { moods } from '@/data/moods';
import { activeJourneyDay, moodOfToday, useAppStore } from '@/store/appStore';
import { colors, fonts, spacing, type } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [minutes, setMinutes] = useState(10);
  const journey = useAppStore((s) => s.journey);
  const moodLog = useAppStore((s) => s.moodLog);

  const todayMood = moodOfToday(moodLog);
  const moodOption = moods.find((m) => m.id === todayMood);
  const activeDay = activeJourneyDay(journey);
  const todaysPlan = activeDay ? journeyDay(activeDay) : undefined;

  const startRoutine = () =>
    router.push({
      pathname: '/player',
      params: { exerciseId: flagshipExercise.id, minutes: String(minutes) },
    });

  return (
    <Screen safeTop={false} contentStyle={{ paddingTop: 0 }}>
      <View style={styles.heroArea}>
        <View style={styles.heroImageWrap} pointerEvents="none">
          <Image
            source={require('@/assets/images/home-hero.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={300}
          />
          <LinearGradient
            colors={['rgba(11,18,32,0.45)', 'rgba(11,18,32,0)', 'rgba(11,18,32,0)', colors.bg]}
            locations={[0, 0.25, 0.62, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={{ paddingTop: insets.top + spacing(3) }}>
          <View style={styles.topRow}>
            <View style={styles.nowPlayingSlot}>
              <NowPlayingBar />
            </View>
            <Pressable
              hitSlop={12}
              style={styles.bellBtn}
              onPress={() => router.push('/settings/reminder')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.brand}>
            <HalsaLogo width={184} />
            <Text style={styles.breathe}>BREATHE</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: spacing(5) }}>
        <View style={{ gap: spacing(1) }}>
          <Text style={type.title}>Bu Geceki Rutinin</Text>
          <Text style={type.caption}>Rahatla, nefes al, bırak.</Text>
        </View>

        <DurationPicker
          durations={flagshipExercise.durations}
          labels={flagshipExercise.durationLabels}
          value={minutes}
          onChange={setMinutes}
        />

        <Button label="Rutine Başla" onPress={startRoutine} />

        <Card onPress={() => router.push('/(tabs)/(home)/sleep-music')} style={styles.rowCard}>
          <IconBadge icon="moon-outline" color={colors.violet} shape="circle" />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Uyku Müzikleri</Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              Nefes egzersizi olmadan dinle.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>

        <Card onPress={() => router.push('/mood')} style={styles.rowCard}>
          <IconBadge icon="happy-outline" color={colors.amber} shape="circle" />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Bugün nasıl hissediyorsun?</Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              {moodOption
                ? `Bugün: ${moodOption.title} ${moodOption.emoji}`
                : 'Sana uygun egzersizi önerelim.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>

        <Card onPress={() => router.push('/(tabs)/(home)/journey')} style={styles.rowCard}>
          <JourneyIcon />
          <View style={{ flex: 1 }}>
            <Text style={type.title}>Hälsa Sleep Journey</Text>
            <Text style={[type.caption, { marginTop: 2 }]}>
              {activeDay
                ? `Gün ${activeDay} / ${JOURNEY_LENGTH}${todaysPlan ? ` · ${todaysPlan.minutes} dk` : ''}`
                : 'Yolculuğu tamamladın 🎉'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroArea: {
    marginHorizontal: -spacing(5),
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(6),
    marginBottom: spacing(5),
    overflow: 'hidden',
    minHeight: 300,
  },
  heroImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(2),
  },
  nowPlayingSlot: {
    flex: 1,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginTop: spacing(14),
  },
  breathe: {
    fontFamily: fonts.medium,
    fontSize: 16,
    letterSpacing: 8,
    color: colors.text,
    marginTop: spacing(2),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
});
