import { StyleSheet, Text, View } from 'react-native';
import type { BreathPattern } from '@/engine/types';
import { colors, fonts, spacing } from '@/theme';

/** "4 sn Nefes Al · 4 sn Bekle · 6 sn Nefes Ver" columns */
export function PatternRow({ pattern }: { pattern: BreathPattern }) {
  return (
    <View style={styles.row}>
      {pattern.phases.map((ph, i) => (
        <View key={i} style={styles.col}>
          <Text style={styles.seconds}>{ph.seconds} sn</Text>
          <Text style={styles.label}>{ph.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing(2),
  },
  col: {
    alignItems: 'center',
    gap: 2,
    minWidth: 72,
  },
  seconds: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
