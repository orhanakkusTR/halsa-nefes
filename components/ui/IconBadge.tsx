import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii } from '@/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
  /** circle | rounded square */
  shape?: 'circle' | 'square';
}

function tint(color: string, alpha: number) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function IconBadge({ icon, color, size = 44, shape = 'square' }: Props) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : radii.sm,
          backgroundColor: tint(color, 0.16),
        },
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
