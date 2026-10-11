import type { LightSettings } from '@/types/settings';

/** 14 màu phát. Có tên để hiện ở nhãn "MÀU NỀN · {tên}". */
export const PLAY_COLORS = [
  { hex: '#FFFFFF', name: 'Trắng' },
  { hex: '#000000', name: 'Đen' },
  { hex: '#FF1A1A', name: 'Đỏ' },
  { hex: '#FF7A00', name: 'Cam' },
  { hex: '#FFD60A', name: 'Vàng' },
  { hex: '#9BFF00', name: 'Chanh' },
  { hex: '#00E05A', name: 'Xanh lá' },
  { hex: '#00E5D0', name: 'Ngọc' },
  { hex: '#00A3FF', name: 'Xanh trời' },
  { hex: '#2E5BFF', name: 'Xanh dương' },
  { hex: '#8A2BFF', name: 'Tím' },
  { hex: '#B794FF', name: 'Tím nhạt' },
  { hex: '#FF2FD6', name: 'Hồng' },
  { hex: '#FF8FC6', name: 'Hồng phấn' },
] as const;

export const TEXT_COLOR_QUICK = ['#FFFFFF', '#000000', '#FFD60A', '#FF1A1A', '#2E5BFF'] as const;

/** Tên màu trong bảng, hoặc mã hex nếu là màu tự nhập. */
export function colorName(hex: string): string {
  const upper = hex.toUpperCase();
  return PLAY_COLORS.find((c) => c.hex === upper)?.name ?? upper;
}

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

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Độ chói tương đối (WCAG): sRGB → linear → 0.2126R + 0.7152G + 0.0722B. Hex lỗi coi như đen. */
export function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0;
  const n = parseInt(normalized.slice(1), 16);
  const r = channelToLinear((n >> 16) & 0xff);
  const g = channelToLinear((n >> 8) & 0xff);
  const b = channelToLinear(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ngưỡng 0.3 (cao hơn mức "chuẩn") là chủ ý: nền đỏ, hồng vẫn dùng chữ trắng. */
const AUTO_TEXT_THRESHOLD = 0.3;

export function autoTextColor(bg: string): '#000000' | '#FFFFFF' {
  return relativeLuminance(bg) > AUTO_TEXT_THRESHOLD ? '#000000' : '#FFFFFF';
}

/** Màu chữ thực tế khi phát. Cầu vồng ở chế độ tự động luôn chữ trắng. */
export function resolveTextColor(
  s: Pick<LightSettings, 'textColorMode' | 'textColor' | 'effect' | 'backgroundColor'>,
): string {
  if (s.textColorMode === 'fixed') return s.textColor;
  return s.effect === 'rainbow' ? '#FFFFFF' : autoTextColor(s.backgroundColor);
}
