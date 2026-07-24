import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
import { colors, spacing, type } from '@/theme';

// Scroll'suz ana sayfa: hero flex ile esner, kompakt cihazda sınırlar daralır.
// 375×812 ölçümü: bölümler (başlık→journey kartı altı) 540px + tab bar 63 +
// alt dolgu 16 + hero-bölüm boşluğu 20 → hero payı = yükseklik − 639.
// 780 altında bölümler de daraltılmazsa sığmaz → kompakt eşiği 780.
const HERO_MIN = spacing(34);
const HERO_MAX = spacing(80);
const HERO_MIN_COMPACT = spacing(30);
const HERO_MAX_COMPACT = spacing(64);
const LOGO_WIDTH = 184;
const LOGO_WIDTH_COMPACT = 120;
const COMPACT_HEIGHT = 780;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < COMPACT_HEIGHT;
  const [minutes, setMinutes] = useState(10);
  const journey = useAppStore((s) => s.journey);
  const moodLog = useAppStore((s) => s.moodLog);

  const todayMood = moodOfToday(moodLog);
  const moodOption = moods.find((m) => m.id === todayMood);
  const activeDay = activeJourneyDay(journey);
  const todaysPlan = activeDay ? journeyDay(activeDay) : undefined;

  const sectionGap = compact ? spacing(2.5) : spacing(5);

  const startRoutine = () =>
    router.push({
      pathname: '/player',
      params: { exerciseId: flagshipExercise.id, minutes: String(minutes) },
    });

  return (
    <Screen scroll={false} safeTop={false} contentStyle={styles.content}>
      <View
        style={[
          styles.heroArea,
          compact
            ? { minHeight: HERO_MIN_COMPACT, maxHeight: HERO_MAX_COMPACT }
            : { minHeight: HERO_MIN, maxHeight: HERO_MAX },
          { marginBottom: sectionGap },
        ]}
      >
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
        <View style={[styles.heroContent, { paddingTop: insets.top + spacing(3) }]}>
          <View style={styles.topRow}>
            <View style={styles.nowPlayingSlot}>
              <NowPlayingBar />
            </View>
            <Pressable
              hitSlop={spacing(2)}
              style={styles.bellBtn}
              onPress={() => router.push('/settings/reminder')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.brand}>
            <HalsaLogo width={compact ? LOGO_WIDTH_COMPACT : LOGO_WIDTH} />
            <Text style={[type.brandCaps, styles.breathe]}>BREATHE</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sections, { gap: sectionGap }]}>
        <View style={{ gap: spacing(1) }}>
          <Text style={type.title}>Bu Geceki Rutinin</Text>
          <Text style={type.caption}>Rahatla, nefes al, bırak.</Text>
        </View>

        <DurationPicker
          durations={flagshipExercise.durations}
          labels={flagshipExercise.durationLabels}
          value={minutes}
          onChange={setMinutes}
          compact={compact}
        />

        <Button label="Rutine Başla" onPress={startRoutine} />

        <Card onPress={() => router.push('/(tabs)/(home)/sleep-music')} style={[styles.rowCard, compact && styles.rowCardCompact]}>
          <IconBadge icon="moon-outline" color={colors.violet} shape="circle" />
          <View style={styles.rowTexts}>
            <Text style={type.title}>Uyku Müzikleri</Text>
            <Text style={[type.caption, styles.rowSubtitle]}>Nefes egzersizi olmadan dinle.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>

        <Card onPress={() => router.push('/mood')} style={[styles.rowCard, compact && styles.rowCardCompact]}>
          <IconBadge icon="happy-outline" color={colors.amber} shape="circle" />
          <View style={styles.rowTexts}>
            <Text style={type.title}>Bugün nasıl hissediyorsun?</Text>
            <Text style={[type.caption, styles.rowSubtitle]}>
              {moodOption
                ? `Bugün: ${moodOption.title} ${moodOption.emoji}`
                : 'Sana uygun egzersizi önerelim.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Card>

        <Card onPress={() => router.push('/(tabs)/(home)/journey')} style={[styles.rowCard, compact && styles.rowCardCompact]}>
          <JourneyIcon />
          <View style={styles.rowTexts}>
            <Text style={type.title}>Hälsa Sleep Journey</Text>
            <Text style={[type.caption, styles.rowSubtitle]}>
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
  content: {
    paddingTop: 0,
  },
  heroArea: {
    flex: 1,
    marginHorizontal: -spacing(5),
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(3),
    overflow: 'hidden',
  },
  heroImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
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
    width: spacing(9),
    height: spacing(9),
    borderRadius: spacing(4.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathe: {
    marginTop: spacing(2),
  },
  sections: {
    flexShrink: 0,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  rowCardCompact: {
    paddingVertical: spacing(2.5),
  },
  rowTexts: {
    flex: 1,
  },
  rowSubtitle: {
    marginTop: spacing(0.5),
  },
});
