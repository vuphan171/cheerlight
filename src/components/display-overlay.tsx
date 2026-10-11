import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { SHADOW, UI } from '@/configs/ui';

const FADE_MS = 200;

/** Lớp mờ dần (200 ms), không nhận chạm khi ẩn. */
function Fade({ visible, children }: { visible: boolean; children: ReactNode }) {
  const style = useAnimatedStyle(() => ({ opacity: withTiming(visible ? 1 : 0, { duration: FADE_MS }) }));
  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

interface DisplayOverlayProps {
  controlsVisible: boolean;
  locked: boolean;
  lockHintVisible: boolean;
  tapHintVisible: boolean;
  flashOn: boolean;
  onExit: () => void;
  onLock: () => void;
  onUnlock: () => void;
}

/**
 * Điều khiển màn Phát: "‹ Thoát" (trái dưới), "Khoá màn hình" (phải dưới), nhãn ⚡ Flash (phải trên).
 * Khi khoá: chỉ còn nhãn "Đã khoá · nhấn giữ để mở" ở giữa đáy.
 */
export function DisplayOverlay({
  controlsVisible,
  locked,
  lockHintVisible,
  tapHintVisible,
  flashOn,
  onExit,
  onLock,
  onUnlock,
}: DisplayOverlayProps) {
  const insets = useSafeAreaInsets();
  // Tránh vùng an toàn (iPhone ngang: notch/Dynamic Island hai bên, home indicator dưới).
  const edges = {
    left: Math.max(insets.left, 16),
    right: Math.max(insets.right, 16),
    bottom: Math.max(insets.bottom, 16),
    top: Math.max(insets.top, 16),
  };

  return (
    <>
      <Fade visible={controlsVisible && !locked}>
        {flashOn ? (
          <View style={[styles.flashBadge, { top: edges.top, right: edges.right }]}>
            <Icon name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.flashLabel}>Flash</Text>
          </View>
        ) : null}
        <Pressable
          onPress={onExit}
          accessibilityRole="button"
          accessibilityLabel="Thoát màn Phát"
          style={({ pressed }) => [
            styles.pill,
            styles.exit,
            SHADOW.floating,
            { left: edges.left, bottom: edges.bottom },
            pressed && styles.pressed,
          ]}>
          <Icon name="chevron-back" size={18} color={UI.label} />
          <Text style={styles.exitLabel}>Thoát</Text>
        </Pressable>
        <Pressable
          onPress={onLock}
          accessibilityRole="button"
          accessibilityLabel="Khoá màn hình"
          accessibilityHint="Chặn chạm và nút quay lại. Nhấn giữ nhãn khoá để mở."
          style={({ pressed }) => [
            styles.pill,
            styles.lock,
            SHADOW.floating,
            { right: edges.right, bottom: edges.bottom },
            pressed && styles.pressed,
          ]}>
          <Icon name="lock-closed" size={16} color={UI.onAccent} />
          <Text style={styles.lockLabel}>Khoá màn hình</Text>
        </Pressable>
      </Fade>

      <Fade visible={locked && lockHintVisible}>
        <View style={[styles.centerBottom, { bottom: edges.bottom }]} pointerEvents="box-none">
          <Pressable
            onLongPress={onUnlock}
            delayLongPress={600}
            accessibilityRole="button"
            accessibilityLabel="Đã khoá. Nhấn giữ để mở khoá"
            accessibilityActions={[{ name: 'activate', label: 'Mở khoá' }]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'activate') onUnlock();
            }}
            style={styles.lockedHint}>
            <Icon name="lock-closed" size={15} color="#FFFFFF" />
            <Text style={styles.hintLabel}>Đã khoá · nhấn giữ để mở</Text>
          </Pressable>
        </View>
      </Fade>

      <Fade visible={tapHintVisible && !controlsVisible && !locked}>
        <View style={[styles.centerBottom, { bottom: edges.bottom }]} pointerEvents="none">
          <View style={styles.tapHint}>
            <Text style={styles.hintLabel}>Chạm để mở điều khiển</Text>
          </View>
        </View>
      </Fade>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  pressed: { opacity: 0.85 },
  exit: { backgroundColor: UI.surface, paddingLeft: 12 },
  exitLabel: { fontSize: 16, fontWeight: '600', color: UI.label },
  lock: { backgroundColor: UI.accent },
  lockLabel: { fontSize: 16, fontWeight: '600', color: UI.onAccent },
  flashBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  flashLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  centerBottom: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  tapHint: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  hintLabel: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
