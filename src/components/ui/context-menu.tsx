import { Fragment } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { SHADOW, UI } from '@/configs/ui';

export interface MenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MenuItem {
  label: string;
  icon: IconName;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Vẽ vạch ngăn nhóm phía trên mục này. */
  separatorBefore?: boolean;
}

interface ContextMenuProps {
  anchor: MenuAnchor | null;
  items: MenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 230;
const ITEM_HEIGHT = 46;
const MARGIN = 12;

/**
 * Popover tự vẽ đặt dưới nút ⋯ (căn trái hoặc phải theo vị trí nút), nền mờ `overlay`.
 * Tự lật lên trên khi không đủ chỗ phía dưới.
 */
export function ContextMenu({ anchor, items, onClose }: ContextMenuProps) {
  const window = useWindowDimensions();
  if (!anchor) return null;

  const separators = items.filter((i) => i.separatorBefore).length;
  const menuHeight = items.length * ITEM_HEIGHT + separators * 8;
  const alignRight = anchor.x + anchor.width / 2 > window.width / 2;
  const left = alignRight
    ? Math.max(MARGIN, anchor.x + anchor.width - MENU_WIDTH)
    : Math.min(window.width - MENU_WIDTH - MARGIN, anchor.x);
  const below = anchor.y + anchor.height + 6;
  const top =
    below + menuHeight + MARGIN > window.height ? Math.max(MARGIN, anchor.y - menuHeight - 6) : below;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Đóng menu" />
      <View style={[styles.menu, SHADOW.floating, { top, left }]} accessibilityRole="menu">
        {items.map((item, i) => (
          <Fragment key={item.label}>
            {item.separatorBefore ? <View style={styles.groupSeparator} /> : null}
            <Pressable
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: item.disabled }}
              disabled={item.disabled}
              onPress={() => {
                onClose();
                // iOS không mở được Modal/Alert mới khi Modal này còn đang đóng → chờ animation fade.
                setTimeout(item.onPress, Platform.OS === 'ios' ? 350 : 0);
              }}
              style={({ pressed }) => [
                styles.item,
                i > 0 && !item.separatorBefore && styles.itemSeparator,
                pressed && styles.pressed,
                item.disabled && styles.disabled,
              ]}>
              <Text style={[styles.label, item.destructive && styles.destructive]}>{item.label}</Text>
              <Icon name={item.icon} size={19} color={item.destructive ? UI.danger : UI.label} />
            </Pressable>
          </Fragment>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: UI.overlay },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: 14,
    backgroundColor: UI.surface,
    overflow: 'hidden',
  },
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  itemSeparator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: UI.separator },
  groupSeparator: { height: 8, backgroundColor: UI.bg },
  pressed: { backgroundColor: 'rgba(0,0,0,0.06)' },
  disabled: { opacity: 0.35 },
  label: { fontSize: 17, color: UI.label },
  destructive: { color: UI.danger },
});
