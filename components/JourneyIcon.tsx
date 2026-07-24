import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

// Hälsa feather mark, adapted from photos/Halsa-Sleep-Journey.svg
// (viewBox tightened to the feather; a stray export artifact was dropped).
const xml = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="58 118 1420 1216">
<path fill="${fill}" d="M 58.121094 862.410156 L 124.398438 862.410156 C 124.398438 862.410156 236.695312 1173.53125 551.5 1101.734375 C 866.304688 1029.9375 890.238281 637.816406 875.511719 523.679688 C 860.785156 409.539062 792.667969 199.671875 792.667969 199.671875 C 792.667969 199.671875 1020.949219 341.425781 947.308594 801.660156 C 947.308594 801.660156 1188.476562 455.5625 923.375 118.671875 C 923.375 118.671875 1556.667969 240.171875 1435.164062 775.886719 C 1435.164062 775.886719 1378.09375 1015.210938 1052.246094 1151.441406 L 1028.3125 1199.304688 C 1028.3125 1199.304688 1403.871094 1153.28125 1477.507812 888.183594 C 1477.507812 888.183594 1459.097656 1202.984375 1043.039062 1306.078125 C 866.308594 1350.261719 676.6875 1342.898438 507.320312 1276.625 C 337.953125 1210.351562 223.8125 1072.277344 113.355469 934.207031 C 94.941406 908.433594 76.53125 886.34375 58.121094 862.410156"/>
</svg>`;

interface Props {
  size?: number;
  /** Feather color */
  color?: string;
  /** Badge background */
  bg?: string;
}

export function JourneyIcon({ size = 44, color = '#EAF0FF', bg = 'rgba(90,214,190,0.16)' }: Props) {
  const w = size * 0.6;
  const h = w * (1216 / 1420);
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <SvgXml xml={xml(color)} width={w} height={h} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
