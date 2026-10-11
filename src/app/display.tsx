import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { DisplayControls } from '@/components/DisplayControls';
import { LightCanvas, useEffectClock } from '@/components/LightCanvas';
import { Marquee } from '@/components/Marquee';
import { TorchController } from '@/components/TorchController';
import { scrollPixelsPerSecond } from '@/constants/effects';
import { fontFamilyFor } from '@/constants/fonts';
import { useLandscape } from '@/hooks/useLandscape';
import { useMaxBrightness } from '@/hooks/useMaxBrightness';
import { useSettings } from '@/hooks/useSettings';

export default function DisplayScreen() {
  useKeepAwake();
  useLandscape();
  useMaxBrightness();
  const { settings, markTorchUnavailable } = useSettings();
  // Chỉ ẩn thanh hệ thống khi màn hình đang focus (có thể còn mount phía dưới stack).
  const focused = useIsFocused();
  const progress = useEffectClock(settings.effect, settings.speed);

  // Thanh điều khiển nổi: chạm màn hình để ẩn/hiện, tự ẩn sau 3 giây không tương tác.
  // Hiện sẵn lúc mới vào để người dùng biết là có.
  const [controlsVisible, setControlsVisible] = useState(true);
  const [interactionKey, setInteractionKey] = useState(0);
  const hideControls = useCallback(() => setControlsVisible(false), []);
  const bumpInteraction = useCallback(() => setInteractionKey((k) => k + 1), []);
  const toggleControls = () => {
    setControlsVisible((v) => !v);
    bumpInteraction();
  };

  return (
    <Pressable
      style={styles.container}
      onPress={toggleControls}
      accessibilityLabel="Chạm để hiện thanh điều khiển"
      accessibilityHint="Thanh điều khiển tự ẩn sau 3 giây">
      <StatusBar hidden={focused} style="light" />
      <NavigationBar hidden={focused} />
      <LightCanvas color={settings.backgroundColor} effect={settings.effect} progress={progress} />
      <Marquee
        text={settings.text}
        color={settings.textColor}
        fontSize={settings.fontSize}
        fontFamily={fontFamilyFor(settings.textFont)}
        pixelsPerSecond={scrollPixelsPerSecond(settings.scrollSpeed)}
        direction={settings.scrollDirection}
      />
      <TorchController
        settings={settings}
        progress={progress}
        active={focused}
        onUnavailable={markTorchUnavailable}
      />
      <DisplayControls
        visible={controlsVisible}
        interactionKey={interactionKey}
        onInteract={bumpInteraction}
        onHide={hideControls}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
