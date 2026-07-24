import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Header, Screen } from '@/components/ui';
import { moods, recommendationReason, recommendedExerciseId } from '@/data/moods';
import type { MoodId } from '@/lib/model';
import { useAppStore } from '@/store/appStore';
import { colors, fonts, radii, spacing, type } from '@/theme';

export default function MoodScreen() {
  const router = useRouter();
  const setMoodToday = useAppStore((s) => s.setMoodToday);
  const [selected, setSelected] = useState<MoodId | null>(null);

  const proceed = () => {
    if (!selected) return;
    setMoodToday(selected);
    const exerciseId = recommendedExerciseId(selected, new Date().getHours());
    router.replace({
      pathname: '/exercise/[id]',
      params: { id: exerciseId, reason: recommendationReason(selected) },
    });
  };

  return (
    <Screen header={<Header title="Bugün nasıl hissediyorsun?" safeTop={false} />}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <Text style={[type.caption, styles.subtitle]}>
        Sana en uygun nefes egzersizini önerelim.
      </Text>

      <View style={{ gap: spacing(3) }}>
        {moods.map((m) => {
          const active = selected === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setSelected(m.id)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={styles.emoji}>{m.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={type.title}>{m.title}</Text>
                <Text style={[type.caption, { marginTop: 2 }]}>{m.subtitle}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        label="Devam Et"
        onPress={proceed}
        disabled={!selected}
        style={{ marginTop: spacing(6) }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing(5),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3.5),
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
  },
  optionActive: {
    borderColor: 'rgba(139,149,246,0.65)',
    backgroundColor: colors.primarySoft,
  },
  emoji: {
    fontSize: 28,
    fontFamily: fonts.regular,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
