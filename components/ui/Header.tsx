import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/theme';

interface Props {
  title?: string;
  /**
   * 'bar': başlık üst barda ortalanır (eski davranış).
   * 'large': barda yalnızca geri oku + sağ aksiyon; başlık barın altında
   * type.h2 ile sola yaslı büyük başlık olarak akar (ui-audit standardı).
   */
  variant?: 'bar' | 'large';
  /** back chevron (default) | close X | none */
  leftIcon?: 'back' | 'close' | 'none';
  onLeft?: () => void;
  right?: ReactNode;
  /** include top safe-area padding (default true) */
  safeTop?: boolean;
}

export function Header({
  title,
  variant = 'bar',
  leftIcon = 'back',
  onLeft,
  right,
  safeTop = true,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = onLeft ?? (() => (router.canGoBack() ? router.back() : router.navigate('/')));
  const padTop = (safeTop ? insets.top : 0) + spacing(4);

  const backButton =
    leftIcon !== 'none' ? (
      <Pressable onPress={goBack} hitSlop={spacing(2)} style={styles.iconBtn}>
        <Ionicons
          name={leftIcon === 'close' ? 'close' : 'arrow-back'}
          size={22}
          color={colors.text}
        />
      </Pressable>
    ) : null;

  if (variant === 'large') {
    return (
      <View>
        <View style={[styles.bar, { paddingTop: padTop }]}>
          <View style={styles.side}>{backButton}</View>
          <View style={styles.flexSpace} />
          <View style={[styles.side, styles.right]}>{right}</View>
        </View>
        <Text style={[type.h2, styles.largeTitle]} numberOfLines={2}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.bar, styles.barBottom, { paddingTop: padTop }]}>
      <View style={styles.side}>{backButton}</View>
      <Text style={[type.title, styles.barTitle]} numberOfLines={1}>
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
    backgroundColor: 'transparent',
  },
  barBottom: {
    paddingBottom: spacing(3),
  },
  side: { minWidth: spacing(11) },
  right: { alignItems: 'flex-end' },
  flexSpace: { flex: 1 },
  barTitle: { flex: 1, textAlign: 'center' },
  largeTitle: {
    paddingHorizontal: spacing(5),
    marginTop: spacing(2),
    paddingBottom: spacing(4),
  },
  iconBtn: {
    width: spacing(9),
    height: spacing(9),
    borderRadius: spacing(4.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
