import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { RADII, SHADOW, TYPE, UI } from '@/configs/ui';

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string; accessibilityLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
}

const PAD = 2;

/** Segmented kiểu iOS: track `fill`, thumb trắng trượt bằng Reanimated. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;

  const thumbStyle = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withTiming(index * segment, { duration: 200 }) }],
  }));

  return (
    <View
      style={styles.track}
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segment > 0 ? <Animated.View style={[styles.thumb, SHADOW.small, thumbStyle]} /> : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            onPress={() => onChange(option.value)}
            style={styles.option}>
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 32,
    padding: PAD,
    borderRadius: RADII.segmented,
    backgroundColor: UI.fill,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: RADII.segmentedThumb,
    backgroundColor: UI.surface,
  },
  option: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  label: TYPE.segmented,
  labelSelected: { fontWeight: '600' },
});
