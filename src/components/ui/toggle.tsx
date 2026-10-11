import type React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useAnimatedTheme } from 'react-native-unistyles/reanimated';

import { SIZE_STEP } from '@/configs/size';
import type { Size } from '@/types/size';

const DURATION_MS = 200;
const WIDTH_RATIO = 1.75;
const THUMB_INSET = 2;

const trackSize = (height: number) => ({
  width: height * WIDTH_RATIO,
  height,
});

const thumbSize = (trackHeight: number) => ({
  width: trackHeight - THUMB_INSET * 2,
  height: trackHeight - THUMB_INSET * 2,
});

interface Props extends Omit<PressableProps, 'onPress'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: Size;
}

const Toggle: React.FC<Props> = ({
  value,
  onValueChange,
  size = 'md',
  disabled,
  style,
  ...props
}) => {
  styles.useVariants({ size, disabled: !!disabled });

  const { theme } = useUnistyles();
  const animatedTheme = useAnimatedTheme();

  const trackHeight = theme.lineHeight(SIZE_STEP[size]);
  const thumbOnOffset = trackHeight * WIDTH_RATIO - trackHeight;

  const progress = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: DURATION_MS }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [animatedTheme.value.colors.fill, animatedTheme.value.colors.accent],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * thumbOnOffset }],
  }));

  return (
    <Pressable
      hitSlop={8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={(state) => [styles.container, typeof style === 'function' ? style(state) : style]}
      {...props}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      disabled: {
        true: { opacity: theme.opacity.disabled },
      },
    },
  },
  track: {
    padding: THUMB_INSET,
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    variants: {
      size: {
        xs: trackSize(theme.lineHeight(SIZE_STEP.xs)),
        sm: trackSize(theme.lineHeight(SIZE_STEP.sm)),
        md: trackSize(theme.lineHeight(SIZE_STEP.md)),
        lg: trackSize(theme.lineHeight(SIZE_STEP.lg)),
      },
    },
  },
  thumb: {
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadows.sm,
    variants: {
      size: {
        xs: thumbSize(theme.lineHeight(SIZE_STEP.xs)),
        sm: thumbSize(theme.lineHeight(SIZE_STEP.sm)),
        md: thumbSize(theme.lineHeight(SIZE_STEP.md)),
        lg: thumbSize(theme.lineHeight(SIZE_STEP.lg)),
      },
    },
  },
}));

export { Toggle };
