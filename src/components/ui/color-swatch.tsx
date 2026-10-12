import type React from 'react';
import { Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '@/components/ui/icon';
import { autoTextColor } from '@/configs/colors';
import { SWATCH_STEP } from '@/configs/size';
import type { AppTheme } from '@/configs/theme';
import type { Size } from '@/types/size';

const sizes = (theme: AppTheme) => ({
  xs: {
    ringWidth: theme.borderWidth.thin,
    ringGap: theme.borderWidth.regular,
    iconSize: theme.fontSize(1),
  },
  sm: {
    ringWidth: theme.borderWidth.regular,
    ringGap: theme.borderWidth.regular,
    iconSize: theme.fontSize(2),
  },
  md: {
    ringWidth: theme.borderWidth.regular,
    ringGap: theme.borderWidth.regular,
    iconSize: theme.fontSize(2),
  },
  lg: {
    ringWidth: theme.borderWidth.regular,
    ringGap: theme.borderWidth.thick,
    iconSize: theme.fontSize(4),
  },
});

const squareSize = (side: number) => ({
  width: side,
  height: side,
});

interface Props extends Omit<PressableProps, 'style'> {
  color: string;
  selected: boolean;
  size?: Size;
  ringWidth?: number;
  ringGap?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

const ColorSwatch: React.FC<Props> = ({
  color,
  selected,
  size = 'lg',
  ringWidth,
  ringGap,
  iconSize,
  style,
  ...props
}) => {
  styles.useVariants({ size, selected });

  const { theme } = useUnistyles();

  const defaults = sizes(theme)[size];

  return (
    <Pressable
      hitSlop={4}
      style={[styles.outer, { borderWidth: ringWidth ?? defaults.ringWidth }, style]}
      {...props}>
      <View
        style={[
          styles.inner,
          { backgroundColor: color },
          selected && { margin: ringGap ?? defaults.ringGap },
        ]}>
        {selected ? (
          <Icon
            name="checkmark"
            size={iconSize ?? defaults.iconSize}
            color={autoTextColor(color)}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  outer: {
    borderColor: 'transparent',
    borderRadius: theme.radii.full,
    variants: {
      size: {
        xs: squareSize(theme.lineHeight(SWATCH_STEP.xs)),
        sm: squareSize(theme.lineHeight(SWATCH_STEP.sm)),
        md: squareSize(theme.lineHeight(SWATCH_STEP.md)),
        lg: squareSize(theme.lineHeight(SWATCH_STEP.lg)),
      },
      selected: {
        true: { borderColor: theme.colors.accent },
      },
    },
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.separator,
  },
}));

export { ColorSwatch };
