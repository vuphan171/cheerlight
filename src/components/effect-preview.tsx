import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { LightCanvas, useEffectClock } from '@/components/light-canvas';
import { Marquee } from '@/components/marquee';
import { scrollPixelsPerSecond } from '@/configs/effects';
import { fontFamilyFor } from '@/configs/fonts';
import { RADIUS, UI } from '@/configs/ui';
import type { LightSettings } from '@/types/settings';

/**
 * Bản thu nhỏ của màn hình `display` (đúng tỉ lệ khung hình ngang). Cỡ chữ và tốc độ chạy chữ
 * được nhân cùng tỉ lệ để nhìn giống hệt khi chạy thật.
 */
export function EffectPreview({ settings }: { settings: LightSettings }) {
  const window = useWindowDimensions();
  const landscapeWidth = Math.max(window.width, window.height);
  const landscapeHeight = Math.min(window.width, window.height);
  const [boxWidth, setBoxWidth] = useState(0);
  const scale = boxWidth > 0 ? boxWidth / landscapeWidth : 0;
  const progress = useEffectClock(settings.effect, settings.speed);

  return (
    <View
      style={[styles.box, { aspectRatio: landscapeWidth / landscapeHeight }]}
      onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
      accessibilityLabel="Xem trước hiệu ứng">
      <LightCanvas color={settings.backgroundColor} effect={settings.effect} progress={progress} />
      {scale > 0 ? (
        <Marquee
          text={settings.text}
          color={settings.textColor}
          fontSize={settings.fontSize * scale}
          fontFamily={fontFamilyFor(settings.textFont)}
          pixelsPerSecond={scrollPixelsPerSecond(settings.scrollSpeed) * scale}
          direction={settings.scrollDirection}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: UI.border,
  },
});
