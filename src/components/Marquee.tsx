import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import type { ScrollDirection } from '@/types/settings';

interface MarqueeProps {
  text: string;
  color: string;
  fontSize: number;
  fontFamily?: string;
  pixelsPerSecond: number;
  direction: ScrollDirection;
}

const TIMING = { easing: Easing.linear, reduceMotion: ReduceMotion.Never } as const;

/**
 * Container của dòng chữ rộng "vô hạn" để Yoga không bao giờ giới hạn chiều rộng Text
 * (nếu không, Text sẽ bị cắt hoặc xuống dòng). View này không vẽ gì nên không tốn bộ nhớ.
 */
const UNBOUNDED_WIDTH = 1_000_000;

/** Mỗi đoạn chữ tối đa ~N ký tự, để không có Text view nào quá rộng (giới hạn texture/bộ nhớ). */
const CHUNK_CHARS = 24;

/** Tách theo khoảng trắng (không cắt giữa dấu tiếng Việt hay chuỗi emoji ZWJ). */
function chunkText(text: string): string[] {
  // split với nhóm bắt giữ giữ lại cả khoảng trắng: ['xin', ' ', 'chào', ...]
  const tokens = text.split(/(\s+)/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const word of tokens) {
    if (current && !/^\s+$/.test(word) && current.length + word.length > CHUNK_CHARS) {
      chunks.push(current);
      current = '';
    }
    current += word;
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Chạy trên UI thread: đi tiếp từ vị trí hiện tại tới `to`, rồi lặp `from → to` vô hạn.
 * Tốc độ (px/s) là hằng số, nên thời gian một vòng = (textWidth + screenWidth) / pps.
 */
function startScroll(x: SharedValue<number>, from: number, to: number, pps: number, reset: boolean) {
  'worklet';
  cancelAnimation(x);
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const start = reset || x.value < lo || x.value > hi ? from : x.value;
  x.value = start;
  const fullMs = (Math.abs(to - from) / pps) * 1000;
  const firstMs = (Math.abs(to - start) / pps) * 1000;
  x.value = withSequence(
    ReduceMotion.Never,
    withTiming(to, { ...TIMING, duration: firstMs }),
    withRepeat(
      withSequence(
        ReduceMotion.Never,
        withTiming(from, { ...TIMING, duration: 0 }),
        withTiming(to, { ...TIMING, duration: fullMs }),
      ),
      -1,
      false,
      undefined,
      ReduceMotion.Never,
    ),
  );
}

function stopScroll(x: SharedValue<number>) {
  'worklet';
  cancelAnimation(x);
}

export function Marquee({
  text,
  color,
  fontSize,
  fontFamily,
  pixelsPerSecond,
  direction,
}: MarqueeProps) {
  const [screenWidth, setScreenWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const x = useSharedValue(UNBOUNDED_WIDTH);
  const chunks = useMemo(() => chunkText(text), [text]);

  // Nội dung/hướng/cỡ chữ đổi → chạy lại từ mép; chỉ đổi tốc độ → đi tiếp từ vị trí hiện tại.
  const contentKey = `${text}|${fontSize}|${fontFamily ?? ''}|${direction}`;
  const lastContentKey = useRef('');

  useEffect(() => {
    if (!screenWidth || !textWidth) return;
    const reset = lastContentKey.current !== contentKey;
    lastContentKey.current = contentKey;
    const [from, to] =
      direction === 'left' ? [screenWidth, -textWidth] : [-textWidth, screenWidth];
    scheduleOnUI(startScroll, x, from, to, Math.max(1, pixelsPerSecond), reset);
  }, [contentKey, direction, pixelsPerSecond, screenWidth, textWidth, x]);

  useEffect(() => () => scheduleOnUI(stopScroll, x), [x]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  const onContainerLayout = (e: LayoutChangeEvent) => setScreenWidth(e.nativeEvent.layout.width);
  const onTextLayout = (e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width);

  if (!text) return null;

  return (
    <View style={styles.container} pointerEvents="none" onLayout={onContainerLayout}>
      <Animated.View style={[styles.track, animatedStyle]}>
        <View style={styles.row} onLayout={onTextLayout}>
          {chunks.map((chunk, i) => (
            <Text
              key={i}
              numberOfLines={1}
              allowFontScaling={false}
              style={[styles.text, { color, fontSize, lineHeight: fontSize * 1.25, fontFamily }]}>
              {chunk}
            </Text>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  track: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: UNBOUNDED_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: { flexDirection: 'row' },
  text: { includeFontPadding: false },
});
