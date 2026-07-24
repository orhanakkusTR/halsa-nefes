import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { DayStepper } from '@/components/journey/DayStepper';
import { Card, Header, IconBadge, Screen } from '@/components/ui';
import { exerciseById } from '@/data/exercises';
import { journeyDay, JOURNEY_LENGTH } from '@/data/journey';
import { activeJourneyDay, journeyDoneToday, useAppStore } from '@/store/appStore';
import { colors, radii, spacing, type } from '@/theme';

export default function JourneyScreen() {
  const router = useRouter();
  const journey = useAppStore((s) => s.journey);
  const sessions = useAppStore((s) => s.sessions);

  const activeDay = activeJourneyDay(journey);
  const doneToday = journeyDoneToday(sessions);
  const plan = activeDay ? journeyDay(activeDay) : undefined;
  const exercise = plan ? exerciseById(plan.exerciseId) : undefined;
  const finished = activeDay === null;

  const startToday = () => {
    if (!plan || !exercise || doneToday) return;
    router.push({
      pathname: '/player',
      params: {
        exerciseId: exercise.id,
        minutes: String(plan.minutes),
        journeyDay: String(plan.day),
      },
    });
  };

  return (
    <Screen header={<Header title="Hälsa Sleep Journey" variant="large" />}>
      <View style={{ gap: spacing(5) }}>
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/journey-hero.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={300}
          />
          <LinearGradient
            colors={['rgba(11,18,32,0.72)', 'rgba(11,18,32,0.28)', 'rgba(11,18,32,0.05)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ flex: 1, gap: spacing(1.5) }}>
            <Text style={type.h2}>İlk 30 Günlük{'\n'}Yolculuğun</Text>
            <Text style={type.caption}>Her gün küçük bir adım,{'\n'}daha iyi bir uyku.</Text>
          </View>
        </View>

        <DayStepper
          totalDays={JOURNEY_LENGTH}
          completedDays={journey.completedDays}
          activeDay={activeDay}
        />

        {finished ? (
          <Card style={styles.doneCard}>
            <Ionicons name="trophy" size={40} color={colors.gold} />
            <Text style={type.h2}>Yolculuk Tamamlandı!</Text>
            <Text style={[type.caption, { textAlign: 'center' }]}>
              30 günlük uyku yolculuğunu bitirdin. Rutinine egzersizler sekmesinden devam
              edebilirsin.
            </Text>
          </Card>
        ) : (
          <>
            <View style={{ gap: spacing(3) }}>
              <Text style={type.title}>Bugünkü Rutinin</Text>
              {exercise && plan ? (
                <Card style={styles.routineCard} onPress={doneToday ? undefined : startToday}>
                  <IconBadge icon={exercise.icon} color={exercise.color} shape="circle" />
                  <View style={{ flex: 1 }}>
                    <Text style={type.title}>{exercise.title}</Text>
                    <Text style={[type.caption, { marginTop: 2 }]}>{plan.minutes} dk</Text>
                  </View>
                  {doneToday ? (
                    <View style={styles.doneChip}>
                      <Ionicons name="checkmark" size={14} color={colors.teal} />
                      <Text style={[type.micro, styles.doneChipText]}>Bugün tamamlandı</Text>
                    </View>
                  ) : (
                    <Pressable onPress={startToday} hitSlop={8} style={styles.playBtn}>
                      <Ionicons name="play" size={20} color="#10142E" />
                    </Pressable>
                  )}
                </Card>
              ) : null}
            </View>

            {plan ? (
              <Card>
                <Text style={[type.micro, styles.whyLabel]}>Neden Bugün?</Text>
                <Text style={[type.body, { color: colors.textSecondary }]}>{plan.reason}</Text>
              </Card>
            ) : null}

            {doneToday ? (
              <Text style={[type.caption, { textAlign: 'center' }]}>
                Yarın Gün {activeDay} seni bekliyor. 🌙
              </Text>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    borderRadius: radii.lg,
    padding: spacing(5),
    borderWidth: 1,
    borderColor: 'rgba(139,149,246,0.18)',
    overflow: 'hidden',
    minHeight: 136,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: 'rgba(90,214,190,0.14)',
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
  },
  doneChipText: {
    color: colors.teal,
  },
  whyLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing(2),
  },
  doneCard: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(7),
  },
});
