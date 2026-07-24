import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, LinearGradient as SvgGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { niceMax } from '@/lib/charts';
import { colors, fonts } from '@/theme';

interface Props {
  values: number[];
  labels: string[]; // '' entries are skipped
  height?: number;
}

const PAD_LEFT = 30;
const PAD_BOTTOM = 20;
const PAD_TOP = 8;

export function BarChart({ values, labels, height = 170 }: Props) {
  const [width, setWidth] = useState(0);
  const max = niceMax(Math.max(1, ...values));
  const plotW = Math.max(0, width - PAD_LEFT);
  const plotH = height - PAD_BOTTOM - PAD_TOP;
  const n = values.length;
  const slot = n > 0 ? plotW / n : 0;
  const barW = Math.max(2, Math.min(18, slot * 0.55));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <SvgGradient id="bar" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="1" stopColor="#5D66E8" />
            </SvgGradient>
          </Defs>

          {ticks.map((t) => {
            const y = PAD_TOP + plotH * (1 - t);
            return (
              <Line
                key={t}
                x1={PAD_LEFT}
                x2={width}
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
              y={PAD_TOP + plotH * (1 - t) + 4}
              fontSize={10}
              fontFamily={fonts.regular}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {Math.round(max * t)}
            </SvgText>
          ))}

          {values.map((v, i) => {
            const h = Math.max(v > 0 ? 3 : 0, (v / max) * plotH);
            const x = PAD_LEFT + i * slot + (slot - barW) / 2;
            return (
              <Rect
                key={i}
                x={x}
                y={PAD_TOP + plotH - h}
                width={barW}
                height={h}
                rx={Math.min(3, barW / 2)}
                fill="url(#bar)"
                opacity={v > 0 ? 1 : 0.35}
              />
            );
          })}

          {labels.map((label, i) =>
            label ? (
              <SvgText
                key={`x${i}`}
                x={PAD_LEFT + i * slot + slot / 2}
                y={height - 5}
                fontSize={9.5}
                fontFamily={fonts.regular}
                fill={colors.textMuted}
                textAnchor={n > 12 ? 'start' : 'middle'}
              >
                {label}
              </SvgText>
            ) : null
          )}
        </Svg>
      )}
    </View>
  );
}
