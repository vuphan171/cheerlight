import { router } from 'expo-router';
import { useRef } from 'react';

import { useEffectChooser } from '@/components/strobe-warning';
import { useSettings } from '@/hooks/use-settings';
import type { LightSettings } from '@/types/settings';

/**
 * Phát một bộ cài đặt: đặt `nowPlaying` rồi mở màn Phát.
 * Strobe chưa được đồng ý cảnh báo thì hiện cảnh báo trước (màn Phát không còn tự cảnh báo).
 * Trả về `warning` cần render trong màn hình gọi.
 */
export function usePlay() {
  const { play } = useSettings();
  const pending = useRef<{ settings: LightSettings; presetId?: string } | null>(null);

  const start = (settings: LightSettings, presetId?: string) => {
    play(settings, presetId);
    router.push('/display');
  };

  const { choose, warning } = useEffectChooser(() => {
    const next = pending.current;
    pending.current = null;
    if (next) start(next.settings, next.presetId);
  });

  const playSettings = (settings: LightSettings, presetId?: string) => {
    pending.current = { settings, presetId };
    choose(settings.effect);
  };

  return { play: playSettings, warning };
}
