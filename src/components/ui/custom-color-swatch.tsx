import type React from 'react';
import { Image, Pressable, PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '@/components/ui/icon';
import { SWATCH_STEP } from '@/configs/size';
import type { AppTheme } from '@/configs/theme';
import type { Size } from '@/types/size';

const sizes = (theme: AppTheme) => ({
  xs: { dotSize: theme.lineHeight(1), iconSize: theme.fontSize(1) },
  sm: { dotSize: theme.lineHeight(1), iconSize: theme.fontSize(1) },
  md: { dotSize: theme.lineHeight(2), iconSize: theme.fontSize(2) },
  lg: { dotSize: theme.lineHeight(3), iconSize: theme.fontSize(3) },
});

const squareSize = (side: number) => ({
  width: side,
  height: side,
});

interface Props extends Omit<PressableProps, 'style'> {
  selected: boolean;
  size?: Size;
  dotSize?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

const CustomColorSwatch: React.FC<Props> = ({
  selected,
  size = 'lg',
  dotSize,
  iconSize,
  style,
  ...props
}) => {
  styles.useVariants({ size, selected });

  const { theme } = useUnistyles();

  const defaults = sizes(theme)[size];

  return (
    <Pressable hitSlop={4} style={[styles.container, style]} {...props}>
      <Image source={require('../../../assets/images/color-ring.png')} style={styles.ring} />
      <View style={[styles.dot, squareSize(dotSize ?? defaults.dotSize)]}>
        <Icon
          name={selected ? 'checkmark' : 'add'}
          size={iconSize ?? defaults.iconSize}
          color={selected ? theme.colors.onAccent : theme.colors.label}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      size: {
        xs: squareSize(theme.lineHeight(SWATCH_STEP.xs)),
        sm: squareSize(theme.lineHeight(SWATCH_STEP.sm)),
        md: squareSize(theme.lineHeight(SWATCH_STEP.md)),
        lg: squareSize(theme.lineHeight(SWATCH_STEP.lg)),
      },
    },
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    variants: {
      size: {
        xs: squareSize(theme.lineHeight(SWATCH_STEP.xs)),
        sm: squareSize(theme.lineHeight(SWATCH_STEP.sm)),
        md: squareSize(theme.lineHeight(SWATCH_STEP.md)),
        lg: squareSize(theme.lineHeight(SWATCH_STEP.lg)),
      },
    },
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    variants: {
      selected: {
        true: { backgroundColor: theme.colors.accent },
      },
    },
  },
}));

export { CustomColorSwatch };
