import type React from 'react';
import { createContext, useContext, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/components/ui/icon';
import { IconBadge } from '@/components/ui/icon-badge';
import { ROW_MIN_HEIGHT, SPACING, TYPE, UI } from '@/configs/ui';

const MenuRowLastContext = createContext(false);

interface Props {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  titleColor?: string;
  icon?: { name: IconName; color: string };
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

const MenuRow: React.FC<Props> = ({
  title,
  subtitle,
  subtitleColor,
  titleColor,
  icon,
  trailing,
  onPress,
  disabled,
  selected,
}) => {
  const last = useContext(MenuRowLastContext);

  const content = (
    <>
      {icon ? <IconBadge name={icon.name} color={icon.color} /> : null}
      <View style={[styles.main, !last && styles.separator]}>
        <View style={styles.text}>
          <Text style={[styles.title, titleColor ? { color: titleColor } : null]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, subtitleColor ? { color: subtitleColor } : null]}
              numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, disabled && styles.disabled]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
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
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: UI.separator },
  text: { flex: 1, gap: 2 },
  title: TYPE.body,
  subtitle: TYPE.caption,
});

const menuValueStyle = { fontSize: 17, color: UI.secondary, flexShrink: 1 } as const;

export { MenuRow, MenuRowLastContext, menuValueStyle };
