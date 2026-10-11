import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import { OFF_COLOR, RAINBOW_COLORS } from '@/configs/colors';
import { effectPeriodMs, ON_RATIO } from '@/configs/effects';
import type { EffectMode } from '@/types/settings';

// Hiệu ứng là thứ người dùng chủ động chọn, nên không tự tắt khi bật "Giảm chuyển động".
const TIMING = { easing: Easing.linear, reduceMotion: ReduceMotion.Never } as const;

const RAINBOW_INPUT = RAINBOW_COLORS.map((_, i) => i / (RAINBOW_COLORS.length - 1));

function startLoop(progress: SharedValue<number>, periodMs: number) {
  'worklet';
  cancelAnimation(progress);
  const current = progress.value;
  const loop = withRepeat(
    withSequence(
      ReduceMotion.Never,
      withTiming(0, { ...TIMING, duration: 0 }),
      withTiming(1, { ...TIMING, duration: periodMs }),
    ),
    -1,
    false,
    undefined,
    ReduceMotion.Never,
  );
  progress.value = withSequence(
    ReduceMotion.Never,
    withTiming(1, { ...TIMING, duration: Math.max(0, (1 - current) * periodMs) }),
    loop,
  );
}

function stopLoop(progress: SharedValue<number>) {
  'worklet';
  cancelAnimation(progress);
}

/**
 * Đồng hồ hiệu ứng: shared value chạy 0 → 1 mỗi chu kỳ trên UI thread.
 * Đổi `speed` thì tiếp tục từ pha hiện tại (không nhảy màu). `solid` thì dừng.
 */
export function useEffectClock(effect: EffectMode, speed: number): SharedValue<number> {
  const progress = useSharedValue(0);
  const period = effectPeriodMs(effect, speed);

  useEffect(() => {
    if (period > 0) scheduleOnUI(startLoop, progress, period);
    else scheduleOnUI(stopLoop, progress);
  }, [period, progress]);

  useEffect(() => () => scheduleOnUI(stopLoop, progress), [progress]);

  return progress;
}

const EFFECT_CODE: Record<EffectMode, number> = { solid: 0, blink: 1, strobe: 2, rainbow: 3 };

interface LightCanvasProps {
  color: string;
  effect: EffectMode;
  progress: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

/** Nền màu toàn màn hình. Màu được tính mỗi frame trên UI thread — không re-render React. */
export function LightCanvas({ color, effect, progress, style }: LightCanvasProps) {
  const colorSV = useSharedValue(color);
  const effectSV = useSharedValue(EFFECT_CODE[effect]);

  useEffect(() => {
    colorSV.set(color);
  }, [color, colorSV]);

  useEffect(() => {
    effectSV.set(EFFECT_CODE[effect]);
  }, [effect, effectSV]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.get();
    switch (effectSV.get()) {
      case EFFECT_CODE.blink:
        return { backgroundColor: p < ON_RATIO.blink ? colorSV.get() : OFF_COLOR };
      case EFFECT_CODE.strobe:
        return { backgroundColor: p < ON_RATIO.strobe ? colorSV.get() : OFF_COLOR };
      case EFFECT_CODE.rainbow:
        return { backgroundColor: interpolateColor(p, RAINBOW_INPUT, RAINBOW_COLORS) };
      default:
        return { backgroundColor: colorSV.get() };
    }
  });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style, animatedStyle]} />
  );
}
