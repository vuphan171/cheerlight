import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { RADII, SHADOW, TYPE, UI } from '@/configs/ui';
import { useStrings, type Strings } from '@/i18n';

const TABS: Record<string, { label: keyof Strings['tabs']; icon: IconName; iconActive: IconName }> =
  {
    index: { label: 'presets', icon: 'albums-outline', iconActive: 'albums' },
    create: { label: 'create', icon: 'color-palette-outline', iconActive: 'color-palette' },
    settings: { label: 'settings', icon: 'settings-outline', iconActive: 'settings' },
  };

const TRANSITION = LinearTransition.duration(220);

/** Android: ẩn thanh tab khi bàn phím mở (tab bar tự vẽ không dùng được `tabBarHideOnKeyboard`). */
function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Bấm tab Tạo luôn mở chế độ tạo mới (xoá `presetId` của chế độ Sửa). */
export function FloatingTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const t = useStrings();
  const keyboardVisible = useKeyboardVisible();
  if (keyboardVisible) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + 8 }]}>
      <View style={[styles.bar, SHADOW.floating]}>
        {state.routes.map((route, index) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;
            if (route.name === 'create') {
              navigation.navigate('create', { presetId: undefined });
            } else if (!focused) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Animated.View key={route.key} layout={TRANSITION}>
              <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  focused && styles.itemActive,
                  focused && pressed && styles.itemActivePressed,
                ]}>
                <Icon
                  name={focused ? meta.iconActive : meta.icon}
                  size={22}
                  color={focused ? UI.onAccent : UI.secondary}
                />
                {focused ? (
                  <Text style={styles.label} numberOfLines={1}>
                    {t.tabs[meta.label]}
                  </Text>
                ) : null}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: RADII.tabBar,
    backgroundColor: UI.surface,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 56,
    height: 48,
    borderRadius: RADII.tabPill,
  },
  itemActive: { backgroundColor: UI.accent, paddingHorizontal: 18 },
  itemActivePressed: { backgroundColor: UI.accentPressed },
  label: { ...TYPE.tabLabel, color: UI.onAccent },
});
