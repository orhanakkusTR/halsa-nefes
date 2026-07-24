import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, spacing } from '@/theme';

type Variant = 'primary' | 'soft' | 'outline' | 'ghost' | 'destructive';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  soft: colors.primarySoft,
  outline: 'transparent',
  ghost: 'transparent',
  destructive: 'rgba(240,142,125,0.14)',
};
const BG_PRESSED: Record<Variant, string> = {
  primary: colors.primaryPressed,
  soft: 'rgba(139,149,246,0.24)',
  outline: colors.primarySoft,
  ghost: 'rgba(139,149,246,0.10)',
  destructive: 'rgba(240,142,125,0.24)',
};
const FG: Record<Variant, string> = {
  primary: '#10142E',
  soft: colors.primary,
  outline: colors.primary,
  ghost: colors.textSecondary,
  destructive: colors.coral,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? BG_PRESSED[variant] : BG[variant] },
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={FG[variant]} />}
          <Text style={[styles.label, { color: FG[variant] }]}>{label}</Text>
          {iconRight && <Ionicons name={iconRight} size={18} color={FG[variant]} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing(5),
  },
  outline: {
    borderWidth: 1,
    borderColor: 'rgba(139,149,246,0.45)',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  disabled: { opacity: 0.45 },
});
