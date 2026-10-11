import type { TextFont } from '@/types/settings';

/** Font dot-matrix (bản tĩnh của Tiny5 với ROND=100, OFL — xem NOTES.md), nhúng lúc build qua plugin expo-font trong app.json. */
export const LED_FONT_FAMILY = 'CheerLightDots';

/** Font icon Ionicons (MIT), nhúng lúc build bằng plugin expo-font trong app.json, không cần thư viện icon native. */
export const ICON_FONT_FAMILY = 'Ionicons';

export function fontFamilyFor(font: TextFont): string | undefined {
  return font === 'led' ? LED_FONT_FAMILY : undefined;
}

export const TEXT_MAX_LENGTH = 500;
