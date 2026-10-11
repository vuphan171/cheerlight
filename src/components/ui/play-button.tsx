import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SHADOW, UI } from '@/configs/ui';

/** Kiểu nút Phát duy nhất trong app: tròn trắng 48, icon ▶ accent. */
export function PlayButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, SHADOW.floating, pressed && styles.pressed]}>
      {/* Đẩy nhẹ sang phải để tam giác nhìn cân giữa. */}
      <Icon name="play" size={22} color={UI.accent} style={styles.icon} />
    </Pressable>
  );
}

const SIZE = 48;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.94 }] },
  icon: { marginLeft: 3 },
});
