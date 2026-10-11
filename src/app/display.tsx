import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet } from 'react-native';

import { LightCanvas, useEffectClock } from '@/components/LightCanvas';
import { Marquee } from '@/components/Marquee';
import { scrollPixelsPerSecond } from '@/constants/effects';
import { fontFamilyFor } from '@/constants/fonts';
import { useLandscape } from '@/hooks/useLandscape';
import { useMaxBrightness } from '@/hooks/useMaxBrightness';
import { useSettings } from '@/hooks/useSettings';

export default function DisplayScreen() {
  useKeepAwake();
  useLandscape();
  useMaxBrightness();
  const { settings } = useSettings();
  // Chỉ ẩn thanh hệ thống khi màn hình đang focus (có thể còn mount phía dưới stack).
  const focused = useIsFocused();
  const progress = useEffectClock(settings.effect, settings.speed);

  return (
    <Pressable style={styles.container} onPress={() => router.back()}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
