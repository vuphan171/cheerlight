import { normalizeHex } from '@/configs/colors';
import { AUTO_HIDE_OPTIONS, DEFAULT_PREFS, DEFAULT_SETTINGS } from '@/configs/defaults';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { TEXT_MAX_LENGTH } from '@/configs/fonts';
import { mostRecentPreset, PRESET_MAX, PRESET_NAME_MAX_LENGTH } from '@/configs/presets';
import type { AppPrefs, LightSettings, Preset, TextColorMode } from '@/types/settings';

function oneOf<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function hex(value: unknown, fallback: string): string {
  return (typeof value === 'string' && normalizeHex(value)) || fallback;
}

function asRecord(raw: unknown): Record<string, unknown> {
  return (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
}

/**
 * Dựng LightSettings hợp lệ từ dữ liệu bất kỳ (JSON cũ, hỏng, thiếu field…).
 * Dữ liệu bản 1.0 không có `textColorMode`: chữ trắng (mặc định cũ) → 'auto', màu khác → 'fixed'.
 */
export function sanitizeSettings(raw: unknown): LightSettings {
  const d = DEFAULT_SETTINGS;
  const r = asRecord(raw);
  const textColor = hex(r.textColor, d.textColor);
  const legacyMode: TextColorMode = textColor === '#FFFFFF' ? 'auto' : 'fixed';
  return {
    backgroundColor: hex(r.backgroundColor, d.backgroundColor),
    effect: oneOf(r.effect, ['solid', 'blink', 'strobe', 'rainbow'], d.effect),
    speed: intIn(r.speed, SPEED_MIN, SPEED_MAX, d.speed),
    text: typeof r.text === 'string' ? r.text.slice(0, TEXT_MAX_LENGTH) : d.text,
    textColorMode: oneOf(r.textColorMode, ['auto', 'fixed'], legacyMode),
    textColor,
    fontSize: intIn(r.fontSize, FONT_SIZE_MIN, FONT_SIZE_MAX, d.fontSize),
    scrollSpeed: intIn(r.scrollSpeed, SPEED_MIN, SPEED_MAX, d.scrollSpeed),
    scrollDirection: oneOf(r.scrollDirection, ['left', 'right'], d.scrollDirection),
    torchEnabled: bool(r.torchEnabled, d.torchEnabled),
    torchSyncWithEffect: bool(r.torchSyncWithEffect, d.torchSyncWithEffect),
    textFont: oneOf(r.textFont, ['led', 'system'], d.textFont),
    torchMode: oneOf(r.torchMode, ['steady', 'blink'], d.torchMode),
    torchRate: intIn(r.torchRate, SPEED_MIN, SPEED_MAX, d.torchRate),
  };
}

/**
 * Dựng danh sách mẫu hợp lệ: bỏ phần tử hỏng, trùng id; giới hạn số lượng và độ dài tên.
 * Mẫu cũ chưa có `updatedAt` thì gán giảm dần theo thứ tự để giữ thứ tự cũ.
 */
export function sanitizePresets(raw: unknown, now = Date.now()): Preset[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const presets: Preset[] = [];
  raw.forEach((item, index) => {
    if (presets.length >= PRESET_MAX) return;
    if (typeof item !== 'object' || item === null) return;
    const r = item as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim().slice(0, PRESET_NAME_MAX_LENGTH) : '';
    if (typeof r.id !== 'string' || !name || seen.has(r.id)) return;
    seen.add(r.id);
    const updatedAt =
      typeof r.updatedAt === 'number' && Number.isFinite(r.updatedAt) ? r.updatedAt : now - index;
    presets.push({ id: r.id, name, settings: sanitizeSettings(r.settings), updatedAt });
  });
  return presets;
}

export function sanitizePrefs(raw: unknown): AppPrefs {
  const d = DEFAULT_PREFS;
  const r = asRecord(raw);
  return {
    showTapHint: bool(r.showTapHint, d.showTapHint),
    maxBrightness: bool(r.maxBrightness, d.maxBrightness),
    autoHideMs: oneOf(r.autoHideMs, AUTO_HIDE_OPTIONS, d.autoHideMs),
  };
}

/** id mẫu "Dùng gần nhất": giữ nếu còn tồn tại, không thì lấy mẫu cập nhật gần nhất. */
export function resolveLastUsedId(raw: unknown, presets: readonly Preset[]): string | undefined {
  if (typeof raw === 'string' && presets.some((p) => p.id === raw)) return raw;
  return mostRecentPreset(presets)?.id;
}
