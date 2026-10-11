import type React from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { IconBadge } from '@/components/ui/icon-badge';
import { ROW_MIN_HEIGHT, SPACING, TYPE, UI } from '@/configs/ui';

interface Props {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  icon?: { name: IconName; color: string };
  /** Giá trị bên phải (màu `secondary`). */
  value?: string;
  chevron?: boolean;
  checked?: boolean;
  /** Phần tử tuỳ ý bên phải (vd. Toggle). */
  accessory?: ReactNode;
  onPress?: () => void;
  titleColor?: string;
  /** Không vẽ vạch chia phía dưới (dòng cuối nhóm). */
  last?: boolean;
  accessibilityRole?: 'button' | 'radio' | 'switch';
  disabled?: boolean;
}

/** Một mục trong `MenuGroup` (kiểu app Cài đặt iOS): icon, tiêu đề, giá trị hoặc toggle bên phải, mũi tên `›`. */
const MenuItem: React.FC<Props> = ({
  title,
  subtitle,
  subtitleColor,
  icon,
  value,
  chevron,
  checked,
  accessory,
  onPress,
  titleColor,
  last,
  accessibilityRole,
  disabled,
}) => {
  const content = (
    <>
      {icon ? <IconBadge name={icon.name} color={icon.color} /> : null}
      <View style={[styles.main, !last && styles.separator]}>
        <View style={styles.text}>
          <Text style={[styles.title, titleColor ? { color: titleColor } : null]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, subtitleColor ? { color: subtitleColor } : null]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {accessory}
        {checked ? <Icon name="checkmark" size={22} color={UI.accent} /> : null}
        {chevron ? <Icon name="chevron-forward" size={18} color={UI.chevron} /> : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, disabled && styles.disabled]} accessible={!accessory}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={{ selected: checked, disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: SPACING, gap: 12 },
  pressed: { backgroundColor: 'rgba(0,0,0,0.06)' },
  disabled: { opacity: 0.45 },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW_MIN_HEIGHT,
    paddingVertical: 8,
    paddingRight: SPACING,
    gap: 8,
  },
  // Vạch chia bắt đầu sau icon (nằm trong phần `main`).
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.separator },
  text: { flex: 1, gap: 2 },
  title: TYPE.body,
  subtitle: TYPE.caption,
  value: { fontSize: 17, color: UI.secondary, flexShrink: 1 },
});

export { MenuItem };
