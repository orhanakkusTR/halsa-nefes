import { forwardRef, ReactNode, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import type { PhaseEvent } from '@/engine/useBreathingEngine';
import { BreathPattern, cycleSeconds } from '@/engine/types';
import { colors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface BreathingRingHandle {
  /** Drive the ring from an engine phase event */
  phase: (e: PhaseEvent) => void;
  pause: () => void;
  reset: () => void;
}

interface Props {
  pattern: BreathPattern;
  size?: number;
  children?: ReactNode;
}

export const BreathingRing = forwardRef<BreathingRingHandle, Props>(
  function BreathingRing({ pattern, size = 300, children }, ref) {
    const stroke = 10;
    const knob = 14;
    const pad = knob + 2;
    const r = (size - pad * 2) / 2;
    const c = 2 * Math.PI * r;
    const center = size / 2;

    // Fraction of the cycle at which each phase starts
    const fractions = useMemo(() => {
      const total = cycleSeconds(pattern);
      const out: { start: number; end: number }[] = [];
      let acc = 0;
      for (const ph of pattern.phases) {
        out.push({ start: acc / total, end: (acc + ph.seconds) / total });
        acc += ph.seconds;
      }
      return out;
    }, [pattern]);

    const progress = useSharedValue(0); // 0..1 around the ring per cycle
    const pulse = useSharedValue(1); // content scale

    useImperativeHandle(ref, () => ({
      phase: (e: PhaseEvent) => {
        const { start, end } = fractions[e.phaseIndex];
        const remaining = Math.max(0, e.durationMs - e.elapsedInPhaseMs);
        const startFraction =
          start + (end - start) * (e.durationMs > 0 ? e.elapsedInPhaseMs / e.durationMs : 0);

        // New cycle: snap back to 0 before sweeping again
        progress.value = e.phaseIndex === 0 && e.elapsedInPhaseMs === 0 ? start : startFraction;
        progress.value = startFraction;
        progress.value = withTiming(end, { duration: remaining, easing: Easing.linear });

        const kind = pattern.phases[e.phaseIndex].kind;
        if (kind === 'inhale') {
          pulse.value = withTiming(1.12, { duration: remaining, easing: Easing.inOut(Easing.cubic) });
        } else if (kind === 'exhale') {
          pulse.value = withTiming(1, { duration: remaining, easing: Easing.inOut(Easing.cubic) });
        }
        // hold / holdOut: freeze wherever the pulse is
      },
      pause: () => {
        cancelAnimation(progress);
        cancelAnimation(pulse);
      },
      reset: () => {
        cancelAnimation(progress);
        cancelAnimation(pulse);
        progress.value = 0;
        pulse.value = 1;
      },
    }));

    const arcProps = useAnimatedProps(() => ({
      strokeDashoffset: c * (1 - progress.value),
    }));
    const glowProps = useAnimatedProps(() => ({
      strokeDashoffset: c * (1 - progress.value),
    }));

    const knobStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${progress.value * 360}deg` }],
    }));
    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulse.value }],
    }));

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.ringGradient[0]} />
              <Stop offset="0.6" stopColor={colors.ringGradient[1]} />
              <Stop offset="1" stopColor={colors.ringGradient[2]} />
            </SvgGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke="rgba(139,149,246,0.16)"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Glow under the arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={r}
            stroke={colors.primary}
            strokeOpacity={0.25}
            strokeWidth={stroke + 10}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${c} ${c}`}
            animatedProps={glowProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={r}
            stroke="url(#ring)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${c} ${c}`}
            animatedProps={arcProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        {/* Knob riding the arc */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, knobStyle]}>
          <View
            style={[
              styles.knob,
              {
                width: knob,
                height: knob,
                borderRadius: knob / 2,
                top: pad - knob / 2 + stroke / 2,
                left: center - knob / 2,
              },
            ]}
          />
        </Animated.View>

        {/* Pulsing center content */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.center, pulseStyle]}>
          {children}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  knob: {
    position: 'absolute',
    backgroundColor: '#F2F5FF',
    shadowColor: '#AEB8FF',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
