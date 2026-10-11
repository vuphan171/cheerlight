import type { TextFont } from '@/types/settings';

/** Font dot-matrix (bản tĩnh của Tiny5 với ROND=100, OFL — xem NOTES.md). */
export const LED_FONT_FAMILY = 'CheerLightDots';

/** Font icon Ionicons (MIT), nạp bằng expo-font nên không cần thư viện icon native. */
export const ICON_FONT_FAMILY = 'Ionicons';

export const FONT_ASSETS = {
  [LED_FONT_FAMILY]: require('../../assets/fonts/CheerLightDots-Regular.ttf'),
  [ICON_FONT_FAMILY]: require('../../assets/fonts/Ionicons.ttf'),
};

export function fontFamilyFor(font: TextFont): string | undefined {
  return font === 'led' ? LED_FONT_FAMILY : undefined;
}

export const TEXT_MAX_LENGTH = 500;
