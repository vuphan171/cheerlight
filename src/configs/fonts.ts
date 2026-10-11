import type { TextFont } from '@/types/settings';

/** Font dot-matrix (bản tĩnh của Tiny5 với ROND=100, OFL — xem NOTES.md). */
export const LED_FONT_FAMILY = 'CheerLightDots';

export const FONT_ASSETS = {
  [LED_FONT_FAMILY]: require('../../assets/fonts/CheerLightDots-Regular.ttf'),
};

export function fontFamilyFor(font: TextFont): string | undefined {
  return font === 'led' ? LED_FONT_FAMILY : undefined;
}

export const TEXT_MAX_LENGTH = 500;
