import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PLAY_UI, SHADOW, UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

const FADE_MS = 200;

function Fade({ visible, children }: { visible: boolean; children: ReactNode }) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: FADE_MS }),
  }));
  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
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
  const t = useStrings();
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
            <Icon name="flash" size={14} color={PLAY_UI.label} />
            <Text style={styles.flashLabel}>{t.flash.badge}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={onExit}
          style={({ pressed }) => [
            styles.pill,
            styles.exit,
            SHADOW.floating,
            { left: edges.left, bottom: edges.bottom },
            pressed && styles.pressed,
          ]}>
          <Icon name="chevron-back" size={18} color={UI.label} />
          <Text style={styles.exitLabel}>{t.display.exit}</Text>
        </Pressable>
        <Pressable
          onPress={onLock}
          style={({ pressed }) => [
            styles.pill,
            styles.lock,
            SHADOW.floating,
            { right: edges.right, bottom: edges.bottom },
            pressed && styles.pressed,
          ]}>
          <Icon name="lock-closed" size={16} color={UI.onAccent} />
          <Text style={styles.lockLabel}>{t.display.lock}</Text>
        </Pressable>
      </Fade>

      <Fade visible={locked && lockHintVisible}>
        <View style={[styles.centerBottom, { bottom: edges.bottom }]} pointerEvents="box-none">
          <Pressable onLongPress={onUnlock} delayLongPress={600} style={styles.lockedHint}>
            <Icon name="lock-closed" size={15} color={PLAY_UI.label} />
            <Text style={styles.hintLabel}>{t.display.lockedLabel}</Text>
          </Pressable>
        </View>
      </Fade>

      <Fade visible={tapHintVisible && !controlsVisible && !locked}>
        <View style={[styles.centerBottom, { bottom: edges.bottom }]} pointerEvents="none">
          <View style={styles.tapHint}>
            <Text style={styles.hintLabel}>{t.display.tapHint}</Text>
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
    backgroundColor: PLAY_UI.chip,
  },
  flashLabel: { fontSize: 13, fontWeight: '600', color: PLAY_UI.label },
  centerBottom: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: PLAY_UI.chip,
  },
  tapHint: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PLAY_UI.chip,
  },
  hintLabel: { fontSize: 15, fontWeight: '600', color: PLAY_UI.label },
});
