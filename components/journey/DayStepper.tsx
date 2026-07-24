import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '@/theme';

const STEP = 44;
const GAP = spacing(4);

interface Props {
  totalDays: number;
  completedDays: number[];
  activeDay: number | null;
}

export function DayStepper({ totalDays, completedDays, activeDay }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!activeDay) return;
    const x = Math.max(0, (activeDay - 2.5) * (STEP + GAP));
    // Center-ish the active day after layout
    const t = setTimeout(() => scrollRef.current?.scrollTo({ x, animated: false }), 50);
    return () => clearTimeout(t);
  }, [activeDay]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const done = completedDays.includes(day);
        const active = day === activeDay;
        return (
          <View key={day} style={styles.item}>
            <View
              style={[
                styles.circle,
                done && styles.done,
                active && styles.active,
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={18} color="#0B1220" />
              ) : (
                <Text style={[styles.num, active && styles.numActive]}>{day}</Text>
              )}
            </View>
            <Text style={[styles.label, active && { color: colors.textSecondary }]}>Gün</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: GAP,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(1),
  },
  item: { alignItems: 'center', gap: spacing(1) },
  circle: {
    width: STEP,
    height: STEP,
    borderRadius: STEP / 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  num: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  numActive: { color: colors.primary },
  label: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },
});
