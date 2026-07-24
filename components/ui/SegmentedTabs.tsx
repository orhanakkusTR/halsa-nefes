import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, spacing } from '@/theme';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** scrollable pills (sounds filters) vs equal-width segments (progress ranges) */
  scrollable?: boolean;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  scrollable = false,
}: Props<T>) {
  const pills = options.map((opt) => {
    const active = opt.value === value;
    return (
      <Pressable
        key={opt.value}
        onPress={() => onChange(opt.value)}
        style={[styles.pill, !scrollable && styles.flexPill, active && styles.activePill]}
      >
        <Text style={[styles.label, active && styles.activeLabel]}>{opt.label}</Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollBleed}
        contentContainerStyle={styles.scrollRow}
      >
        {pills}
      </ScrollView>
    );
  }
  return <ScrollView horizontal={false} contentContainerStyle={styles.row} scrollEnabled={false}>{pills}</ScrollView>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: spacing(1),
  },
  // Kaydırılabilir pill'ler Screen'in yatay dolgusunu taşarak ekran
  // kenarına akar; kenarda sert kesilme olmaz.
  scrollBleed: {
    marginHorizontal: -spacing(5),
  },
  scrollRow: {
    flexDirection: 'row',
    gap: spacing(2),
    paddingHorizontal: spacing(5),
  },
  pill: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  flexPill: { flex: 1 },
  activePill: { backgroundColor: colors.primary },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  activeLabel: { color: '#10142E' },
});
