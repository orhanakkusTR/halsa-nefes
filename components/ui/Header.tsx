import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/theme';

interface Props {
  title?: string;
  /** back chevron (default) | close X | none */
  leftIcon?: 'back' | 'close' | 'none';
  onLeft?: () => void;
  right?: ReactNode;
  /** include top safe-area padding (default true; off inside modals with their own inset) */
  safeTop?: boolean;
}

export function Header({ title, leftIcon = 'back', onLeft, right, safeTop = true }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = onLeft ?? (() => (router.canGoBack() ? router.back() : router.navigate('/')));

  return (
    <View style={[styles.bar, safeTop && { paddingTop: insets.top + spacing(2) }]}>
      <View style={styles.side}>
        {leftIcon !== 'none' && (
          <Pressable onPress={goBack} hitSlop={12} style={styles.iconBtn}>
            <Ionicons
              name={leftIcon === 'close' ? 'close' : 'arrow-back'}
              size={22}
              color={colors.text}
            />
          </Pressable>
        )}
      </View>
      <Text style={[type.title, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(3),
    backgroundColor: 'transparent',
  },
  side: { width: 56 },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
