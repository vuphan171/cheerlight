import type React from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const Card: React.FC<ViewProps> = ({ style, ...props }) => {
  return <View style={[styles.card, style]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.space(4),
    borderRadius: theme.radii.group,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
}));

export { Card };
