import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PatternRow } from '@/components/player/PatternRow';
import { Button, Card, Chip, Header, IconBadge, ListRow, Screen } from '@/components/ui';
import { exerciseById } from '@/data/exercises';
import { soundById } from '@/data/sounds';
import { plannedCycles } from '@/engine/types';
import { useAppStore } from '@/store/appStore';
import { colors, spacing, type } from '@/theme';

export default function ExerciseSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    minutes?: string;
    journeyDay?: string;
    reason?: string;
  }>();
  const exercise = exerciseById(params.id);
  const lastSoundId = useAppStore((s) => s.settings.lastSoundId);
  const soundEnabled = useAppStore((s) => s.settings.soundEnabled);
  const [minutes, setMinutes] = useState(() => {
    const fromParam = Number(params.minutes);
    if (exercise && fromParam && exercise.durations.includes(fromParam)) return fromParam;
    return exercise?.durations[Math.min(1, (exercise?.durations.length ?? 1) - 1)] ?? 10;
  });

  if (!exercise) {
    return (
      <Screen header={<Header title="Egzersiz" variant="large" />}>
        <Text style={type.body}>Egzersiz bulunamadı.</Text>
      </Screen>
    );
  }

  const sound = soundById(lastSoundId);
  const cycles = plannedCycles(exercise.pattern, minutes);

  const start = () =>
    router.push({
      pathname: '/player',
      params: {
        exerciseId: exercise.id,
        minutes: String(minutes),
        ...(params.journeyDay ? { journeyDay: params.journeyDay } : {}),
      },
    });

  return (
    <Screen header={<Header title={exercise.title} variant="large" />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={{ gap: spacing(5) }}>
        <View style={styles.iconWrap}>
          <IconBadge icon={exercise.icon} color={exercise.color} size={72} shape="circle" />
        </View>

        <Text style={[type.body, styles.description]}>{exercise.description}</Text>

        {params.reason ? (
          <Card style={styles.reasonCard}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={[type.caption, { flex: 1, color: colors.text }]}>{params.reason}</Text>
          </Card>
        ) : null}

        <Card padded={false} style={{ paddingVertical: spacing(3) }}>
          <PatternRow pattern={exercise.pattern} />
        </Card>

        <View style={{ gap: spacing(3) }}>
          <Text style={type.title}>Süre</Text>
          <View style={styles.chips}>
            {exercise.durations.map((d) => (
              <Chip
                key={d}
                label={`${d} dk`}
                selected={d === minutes}
                onPress={() => setMinutes(d)}
              />
            ))}
          </View>
          <Text style={type.caption}>Yaklaşık {cycles} nefes döngüsü.</Text>
        </View>

        <ListRow
          title="Arka Plan Sesi"
          subtitle={soundEnabled && sound ? sound.title : 'Sessiz'}
          left={<IconBadge icon="musical-notes-outline" color={colors.violet} shape="circle" />}
          onPress={() => router.push('/sounds')}
        />

        <Button label="Başla" icon="play" onPress={start} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', marginTop: spacing(2) },
  description: { textAlign: 'center', color: colors.textSecondary },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2.5),
    backgroundColor: colors.primarySoft,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
});
