import { useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EffectSelector } from '@/components/EffectSelector';
import { useEffectChooser } from '@/components/StrobeWarning';
import { PRESET_COLORS } from '@/constants/colors';
import { RADIUS, UI } from '@/constants/ui';
import { useSettings } from '@/hooks/useSettings';

export const CONTROLS_AUTO_HIDE_MS = 3000;

interface DisplayControlsProps {
  visible: boolean;
  /** Gọi khi người dùng chạm vào thanh điều khiển — để đếm lại thời gian tự ẩn. */
  onInteract: () => void;
  onHide: () => void;
  onBack: () => void;
  /** Đổi mỗi lần có tương tác; thanh tự ẩn sau CONTROLS_AUTO_HIDE_MS kể từ lần cuối. */
  interactionKey: number;
}

export function DisplayControls({ visible, onInteract, onHide, onBack, interactionKey }: DisplayControlsProps) {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, torchAvailable } = useSettings();
  const [permission] = useCameraPermissions();
  const { choose: chooseEffect, warning } = useEffectChooser((effect) => updateSettings({ effect }));

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, CONTROLS_AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible, interactionKey, onHide]);

  const fade = useAnimatedStyle(() => ({ opacity: withTiming(visible ? 1 : 0, { duration: 200 }) }));
  const showTorch = torchAvailable && permission?.granted === true;

  return (
    <>
      <Animated.View
        pointerEvents={visible ? 'box-none' : 'none'}
        style={[styles.overlay, fade]}
        accessibilityElementsHidden={!visible}>
        <View
          onTouchStart={onInteract}
          // Nhận chạm vào vùng trống của thanh, không cho lọt xuống màn hình (sẽ ẩn thanh).
          onStartShouldSetResponder={() => true}
          style={[
            styles.bar,
            {
              marginBottom: Math.max(insets.bottom, 12),
              marginLeft: Math.max(insets.left, 12),
              marginRight: Math.max(insets.right, 12),
            },
          ]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại cài đặt"
            onPress={onBack}
            style={styles.backButton}>
            <Text style={styles.backLabel}>‹ Quay lại</Text>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <EffectSelector value={settings.effect} onChange={chooseEffect} compact />
            <View style={styles.divider} />
            {PRESET_COLORS.slice(0, 10).map((color) => {
              const selected = color === settings.backgroundColor.toUpperCase();
              return (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityLabel={`Màu ${color}`}
                  accessibilityState={{ selected }}
                  onPress={() => updateSettings({ backgroundColor: color })}
                  style={[styles.swatch, { backgroundColor: color }, selected && styles.swatchSelected]}
                />
              );
            })}
            {showTorch ? (
              <>
                <View style={styles.divider} />
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: settings.torchEnabled }}
                  onPress={() => updateSettings({ torchEnabled: !settings.torchEnabled })}
                  style={[styles.chip, settings.torchEnabled && styles.chipOn]}>
                  <Text style={styles.chipLabel}>⚡ Flash {settings.torchEnabled ? 'Bật' : 'Tắt'}</Text>
                </Pressable>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Animated.View>
      {warning}
    </>
  );
}

const SWATCH = 34;

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'flex-end' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: RADIUS * 1.5,
    backgroundColor: 'rgba(11,11,18,0.88)',
    borderWidth: 1,
    borderColor: UI.border,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS,
    backgroundColor: UI.surfaceRaised,
  },
  backLabel: { color: UI.text, fontWeight: '700', fontSize: 15 },
  scrollContent: { alignItems: 'center', gap: 8, paddingRight: 4 },
  divider: { width: 1, height: 28, backgroundColor: UI.border, marginHorizontal: 4 },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: UI.text },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS,
    backgroundColor: UI.surfaceRaised,
    borderWidth: 1,
    borderColor: UI.border,
  },
  chipOn: { backgroundColor: UI.accent, borderColor: UI.accent },
  chipLabel: { color: UI.text, fontWeight: '600', fontSize: 14 },
});
