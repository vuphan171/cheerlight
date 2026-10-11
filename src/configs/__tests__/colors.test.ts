import { describe, expect, it } from '@jest/globals';

import {
  autoTextColor,
  normalizeHex,
  PLAY_COLORS,
  relativeLuminance,
  resolveTextColor,
} from '@/configs/colors';
import { DEFAULT_SETTINGS } from '@/configs/defaults';

const hexOf = (id: string) => PLAY_COLORS.find((c) => c.id === id)!.hex;

describe('relativeLuminance', () => {
  it('đen = 0, trắng = 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1);
  });
  it('hex lỗi coi như đen', () => {
    expect(relativeLuminance('nope')).toBe(0);
  });
});

describe('autoTextColor (tiêu chí nghiệm thu)', () => {
  it.each(['red', 'pink', 'purple', 'blue', 'black'])('nền %s → chữ trắng', (name) => {
    expect(autoTextColor(hexOf(name))).toBe('#FFFFFF');
  });
  it.each(['white', 'yellow', 'lime', 'green', 'turquoise', 'orange', 'rose', 'sky', 'lavender'])(
    'nền %s → chữ đen',
    (name) => {
      expect(autoTextColor(hexOf(name))).toBe('#000000');
    },
  );
});

describe('resolveTextColor', () => {
  const base = { ...DEFAULT_SETTINGS, backgroundColor: '#FFFFFF' };
  it('auto theo nền', () => {
    expect(resolveTextColor({ ...base, textColorMode: 'auto' })).toBe('#000000');
  });
  it('cầu vồng auto luôn trắng', () => {
    expect(resolveTextColor({ ...base, textColorMode: 'auto', effect: 'rainbow' })).toBe('#FFFFFF');
  });
  it('fixed không phụ thuộc nền', () => {
    const s = { ...base, textColorMode: 'fixed' as const, textColor: '#FFD60A' };
    expect(resolveTextColor(s)).toBe('#FFD60A');
    expect(resolveTextColor({ ...s, backgroundColor: '#000000' })).toBe('#FFD60A');
  });
});

describe('normalizeHex', () => {
  it('chuẩn hoá #RGB, thiếu #, chữ thường', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC');
    expect(normalizeHex('ff0000')).toBe('#FF0000');
    expect(normalizeHex(' #2c73d2 ')).toBe('#2C73D2');
  });
  it('từ chối giá trị lỗi', () => {
    expect(normalizeHex('#12')).toBeNull();
    expect(normalizeHex('#GGGGGG')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
  });
});
