import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, spacing } from '@/theme';

const MOON_ICONS = ['moon-outline', 'moon', 'cloudy-night'] as const;

interface Props {
  durations: number[];
  labels?: Record<number, string>;
  value: number;
  onChange: (minutes: number) => void;
  /** Küçük ekranlarda alt etiketler gizlenir, dikey dolgu daralır */
  compact?: boolean;
}

export function DurationPicker({ durations, labels, value, onChange, compact }: Props) {
  return (
    <View style={styles.row}>
      {durations.map((min, i) => {
        const active = min === value;
        return (
          <Pressable
            key={min}
            onPress={() => onChange(min)}
            style={[styles.card, compact && styles.cardCompact, active && styles.active]}
          >
            <Ionicons
              name={MOON_ICONS[Math.min(i, MOON_ICONS.length - 1)]}
              size={20}
              color={active ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.minutes, active && { color: colors.text }]}>{min} dk</Text>
            {!compact && labels?.[min] ? <Text style={styles.label}>{labels[min]}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: spacing(1.5),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(2),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    paddingVertical: spacing(2.5),
  },
  active: {
    borderColor: 'rgba(139,149,246,0.65)',
    backgroundColor: colors.primarySoft,
  },
  minutes: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
