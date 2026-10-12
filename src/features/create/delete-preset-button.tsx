import type React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '@/components/ui/icon';
import { ROW_MIN_HEIGHT } from '@/configs/ui';
import { useStrings } from '@/i18n';

const DeletePresetButton: React.FC<PressableProps> = ({ style, ...props }) => {
  const t = useStrings();
  const { theme } = useUnistyles();

  return (
    <Pressable
      style={(state) => [
        styles.button,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      <Icon name="trash-outline" size={theme.fontSize(5)} color={theme.colors.danger} />
      <Text style={styles.label}>{t.create.deleteThis}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(2),
    minHeight: ROW_MIN_HEIGHT,
    borderRadius: theme.radii.group,
    backgroundColor: theme.colors.surface,
  },
  pressed: {
    backgroundColor: theme.colors.surfacePressed,
  },
  label: {
    ...theme.type.body,
    color: theme.colors.danger,
  },
}));

export { DeletePresetButton };
