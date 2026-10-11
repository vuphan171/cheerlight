export const PRESET_COLORS = [
  '#FFFFFF',
  '#FF0000',
  '#FF6A00',
  '#FFD400',
  '#A6FF00',
  '#00FF3C',
  '#00FFD5',
  '#00A2FF',
  '#0019FF',
  '#7A00FF',
  '#FF00E6',
  '#FF2E7E',
  '#FF9EC7',
  '#8AFFF0',
] as const;

export const RAINBOW_COLORS = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#8B00FF',
  '#FF0000',
] as const;

export const OFF_COLOR = '#000000';

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

/** Chuẩn hoá về dạng `#RRGGBB` viết hoa. Trả về `null` nếu không hợp lệ. */
export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (!isValidHex(withHash)) return null;
  if (withHash.length === 4) {
    const [, r, g, b] = withHash;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return withHash.toUpperCase();
}
