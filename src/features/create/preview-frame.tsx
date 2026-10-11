import { useIsFocused } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { LightCanvas, useEffectClock } from '@/components/light-canvas';
import { Marquee } from '@/components/marquee';
import { resolveTextColor } from '@/configs/colors';
import { scrollPixelsPerSecond } from '@/configs/effects';
import { fontFamilyFor } from '@/configs/fonts';
import { RADII } from '@/configs/ui';
import type { LightSettings } from '@/types/settings';
import { useStrings } from '@/i18n';

/**
 * Bản thu nhỏ của màn Phát (đúng tỉ lệ khung hình ngang), dùng cùng engine hiệu ứng. Cỡ chữ và tốc
 * độ chạy chữ được nhân cùng tỉ lệ để nhìn giống hệt khi phát. Dừng khi màn hình không focus (đang
 * ở màn Phát hoặc tab khác) để không chạy hai đồng hồ hiệu ứng cùng lúc.
 */
export function PreviewFrame({ settings, children }: { settings: LightSettings; children?: ReactNode }) {
  const t = useStrings();
  const window = useWindowDimensions();
  const focused = useIsFocused();
  const landscapeWidth = Math.max(window.width, window.height);
  const landscapeHeight = Math.min(window.width, window.height);
  const [boxWidth, setBoxWidth] = useState(0);
  const scale = boxWidth > 0 ? boxWidth / landscapeWidth : 0;
  const effect = focused ? settings.effect : 'solid';
  const progress = useEffectClock(effect, settings.speed);

  return (
    <View
      style={[styles.box, { aspectRatio: landscapeWidth / landscapeHeight }]}
      onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={t.create.preview}>
      <LightCanvas color={settings.backgroundColor} effect={effect} progress={progress} />
      {scale > 0 && focused ? (
        <Marquee
          text={settings.text}
          color={resolveTextColor(settings)}
          fontSize={settings.fontSize * scale}
          fontFamily={fontFamilyFor(settings.textFont)}
          pixelsPerSecond={scrollPixelsPerSecond(settings.scrollSpeed) * scale}
          direction={settings.scrollDirection}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', borderRadius: RADII.preview, overflow: 'hidden', backgroundColor: '#000' },
});
