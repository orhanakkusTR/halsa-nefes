import { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { smoothPath } from '@/lib/charts';
import { colors, fonts } from '@/theme';

interface Props {
  points: { label: string; pct: number }[]; // pct 0..100
  height?: number;
}

const PAD_LEFT = 34;
const PAD_RIGHT = 10;
const PAD_BOTTOM = 20;
const PAD_TOP = 8;

export function LineChart({ points, height = 170 }: Props) {
  const [width, setWidth] = useState(0);
  const plotW = Math.max(0, width - PAD_LEFT - PAD_RIGHT);
  const plotH = height - PAD_BOTTOM - PAD_TOP;
  const n = points.length;
  const xy = points.map((p, i) => ({
    x: PAD_LEFT + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2),
    y: PAD_TOP + plotH * (1 - p.pct / 100),
  }));
  const line = smoothPath(xy);
  const area =
    xy.length > 1
      ? `${line} L ${xy[xy.length - 1].x} ${PAD_TOP + plotH} L ${xy[0].x} ${PAD_TOP + plotH} Z`
      : '';
  const ticks = [0, 25, 50, 75, 100];

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <SvgGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.teal} stopOpacity={0.28} />
              <Stop offset="1" stopColor={colors.teal} stopOpacity={0.02} />
            </SvgGradient>
          </Defs>

          {ticks.map((t) => {
            const y = PAD_TOP + plotH * (1 - t / 100);
            return (
              <Line
                key={t}
                x1={PAD_LEFT}
                x2={width - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="rgba(148,163,255,0.09)"
                strokeWidth={1}
              />
            );
          })}
          {ticks.map((t) => (
            <SvgText
              key={`l${t}`}
              x={PAD_LEFT - 7}
              y={PAD_TOP + plotH * (1 - t / 100) + 4}
              fontSize={10}
              fontFamily={fonts.regular}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {`%${t}`}
            </SvgText>
          ))}

          {area ? <Path d={area} fill="url(#area)" /> : null}
          <Path d={line} stroke={colors.teal} strokeWidth={2.5} fill="none" strokeLinecap="round" />

          {xy.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors.teal} />
          ))}

          {points.map((p, i) => (
            <SvgText
              key={`x${i}`}
              x={xy[i].x}
              y={height - 5}
              fontSize={9.5}
              fontFamily={fonts.regular}
              fill={colors.textMuted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
