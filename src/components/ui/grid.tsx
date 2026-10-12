import type React from 'react';
import { Children } from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { ScaleStep } from '@/configs/theme';

interface Props extends ViewProps {
  columns: number;
  gap?: ScaleStep;
  gapX?: ScaleStep;
  gapY?: ScaleStep;
}

const Grid: React.FC<Props> = ({
  columns,
  gap,
  gapX = gap,
  gapY = gap,
  style,
  children,
  ...props
}) => {
  const { theme } = useUnistyles();

  const gutter = gapX ? theme.space(gapX) / 2 : 0;
  const rowGap = gapY ? theme.space(gapY) : 0;
  const cellWidth = `${Math.floor(10000 / columns) / 100}%` as const;

  return (
    <View style={[styles.grid, { marginHorizontal: -gutter, rowGap }, style]} {...props}>
      {Children.map(children, (child) => (
        <View style={[styles.cell, { width: cellWidth, paddingHorizontal: gutter }]}>{child}</View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    alignItems: 'center',
  },
});

export { Grid };
