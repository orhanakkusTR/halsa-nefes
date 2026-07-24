import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/theme';

interface Props {
  children: ReactNode;
  /** Fixed header rendered above the scroll area (handles its own safe-area) */
  header?: ReactNode;
  /** Full-bleed background layer behind header + content (image, gradient…) */
  background?: ReactNode;
  /** Scrollable content (default true) */
  scroll?: boolean;
  /** Night-sky gradient at the top of the screen */
  gradientTop?: boolean;
  /** Respect top safe-area inset (default true; ignored when header is present) */
  safeTop?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  header,
  background,
  scroll = true,
  gradientTop = false,
  safeTop = true,
  style,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const padTop = header ? spacing(1) : (safeTop ? insets.top : 0) + spacing(3);

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        { paddingTop: padTop, paddingBottom: insets.bottom + spacing(8) },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        styles.content,
        { paddingTop: padTop, paddingBottom: insets.bottom + spacing(4) },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }, style]}>
      {background ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {background}
        </View>
      ) : null}
      {gradientTop && (
        <LinearGradient
          colors={[colors.bgTop, colors.bg]}
          style={styles.gradient}
          pointerEvents="none"
        />
      )}
      {header}
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing(5) },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
});
