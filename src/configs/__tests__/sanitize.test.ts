import { describe, expect, it } from '@jest/globals';

import { DEFAULT_PREFS, DEFAULT_SETTINGS } from '@/configs/defaults';
import { duplicateName, PRESET_MAX, PRESET_NAME_MAX_LENGTH } from '@/configs/presets';
import {
  resolveLastUsedId,
  sanitizePrefs,
  sanitizePresets,
  sanitizeSettings,
} from '@/configs/sanitize';
import { en } from '@/i18n/en';
import { vi } from '@/i18n/vi';
import type { Preset } from '@/types/settings';

describe('sanitizeSettings — migration v1', () => {
  it('chữ trắng cũ → auto', () => {
    expect(sanitizeSettings({ textColor: '#ffffff' }).textColorMode).toBe('auto');
  });
  it('chữ màu cũ → fixed, giữ màu', () => {
    const s = sanitizeSettings({ textColor: '#FFD400' });
    expect(s.textColorMode).toBe('fixed');
    expect(s.textColor).toBe('#FFD400');
  });
  it('giữ textColorMode hợp lệ đã lưu', () => {
    expect(sanitizeSettings({ textColor: '#FFD400', textColorMode: 'auto' }).textColorMode).toBe(
      'auto',
    );
  });
  it('màu nền đã bỏ khỏi bảng vẫn giữ nguyên hex', () => {
    expect(sanitizeSettings({ backgroundColor: '#FF2E7E' }).backgroundColor).toBe('#FF2E7E');
  });
  it('dữ liệu rác → mặc định', () => {
    expect(sanitizeSettings('garbage')).toEqual(DEFAULT_SETTINGS);
  });
});

describe('sanitizePresets', () => {
  it('thêm updatedAt giảm dần theo thứ tự cũ', () => {
    const out = sanitizePresets(
      [
        { id: 'a', name: 'A', settings: {} },
        { id: 'b', name: 'B', settings: {} },
      ],
      1000,
    );
    expect(out.map((p) => p.updatedAt)).toEqual([1000, 999]);
  });
  it('bỏ phần tử hỏng, trùng id, giới hạn số lượng', () => {
    const many = Array.from({ length: PRESET_MAX + 5 }, (_, i) => ({ id: `p${i}`, name: `P${i}` }));
    const out = sanitizePresets([null, { id: 'p0', name: '' }, ...many, { id: 'p1', name: 'dup' }]);
    expect(out).toHaveLength(PRESET_MAX);
    expect(new Set(out.map((p) => p.id)).size).toBe(PRESET_MAX);
  });
});

describe('sanitizePrefs', () => {
  it('mặc định khi thiếu', () => {
    expect(sanitizePrefs(undefined)).toEqual(DEFAULT_PREFS);
  });
  it('autoHideMs ngoài danh sách → mặc định', () => {
    expect(sanitizePrefs({ autoHideMs: 4000 }).autoHideMs).toBe(DEFAULT_PREFS.autoHideMs);
    expect(sanitizePrefs({ autoHideMs: 5000 }).autoHideMs).toBe(5000);
  });
});

const preset = (id: string, updatedAt: number, name = id): Preset => ({
  id,
  name,
  settings: DEFAULT_SETTINGS,
  updatedAt,
});

describe('resolveLastUsedId', () => {
  const presets = [preset('a', 1), preset('b', 3), preset('c', 2)];
  it('giữ id còn tồn tại', () => {
    expect(resolveLastUsedId('c', presets)).toBe('c');
  });
  it('id đã xoá / chưa có → mẫu mới nhất', () => {
    expect(resolveLastUsedId('zzz', presets)).toBe('b');
    expect(resolveLastUsedId(undefined, presets)).toBe('b');
  });
  it('không có mẫu → undefined', () => {
    expect(resolveLastUsedId('a', [])).toBeUndefined();
  });
});

describe('duplicateName', () => {
  it('thêm (copy), tránh trùng', () => {
    const list = [preset('1', 0, 'Team'), preset('2', 0, 'Team (copy)')];
    expect(duplicateName(list, 'Team', en)).toBe('Team (copy 2)');
  });
  it('tiếng Việt: (bản sao)', () => {
    const list = [preset('1', 0, 'Đội tuyển'), preset('2', 0, 'Đội tuyển (bản sao)')];
    expect(duplicateName(list, 'Đội tuyển', vi)).toBe('Đội tuyển (bản sao 2)');
  });
  it('không vượt quá giới hạn độ dài', () => {
    const long = 'x'.repeat(PRESET_NAME_MAX_LENGTH);
    expect(duplicateName([], long, en).length).toBeLessThanOrEqual(PRESET_NAME_MAX_LENGTH);
  });
});
