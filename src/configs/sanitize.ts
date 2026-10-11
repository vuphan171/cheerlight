import { normalizeHex } from '@/configs/colors';
import { DEFAULT_SETTINGS } from '@/configs/defaults';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { TEXT_MAX_LENGTH } from '@/configs/fonts';
import { PRESET_MAX, PRESET_NAME_MAX_LENGTH } from '@/configs/presets';
import type { LightSettings, Preset } from '@/types/settings';

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
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

/** Dựng LightSettings hợp lệ từ dữ liệu bất kỳ (JSON cũ, hỏng, thiếu field…). */
export function sanitizeSettings(raw: unknown): LightSettings {
  const d = DEFAULT_SETTINGS;
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    backgroundColor: hex(r.backgroundColor, d.backgroundColor),
    effect: oneOf(r.effect, ['solid', 'blink', 'strobe', 'rainbow'], d.effect),
    speed: intIn(r.speed, SPEED_MIN, SPEED_MAX, d.speed),
    text: typeof r.text === 'string' ? r.text.slice(0, TEXT_MAX_LENGTH) : d.text,
    textColor: hex(r.textColor, d.textColor),
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

/** Dựng danh sách mẫu hợp lệ: bỏ phần tử hỏng, trùng id; giới hạn số lượng và độ dài tên. */
export function sanitizePresets(raw: unknown): Preset[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const presets: Preset[] = [];
  for (const item of raw) {
    if (presets.length >= PRESET_MAX) break;
    if (typeof item !== 'object' || item === null) continue;
    const r = item as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim().slice(0, PRESET_NAME_MAX_LENGTH) : '';
    if (typeof r.id !== 'string' || !name || seen.has(r.id)) continue;
    seen.add(r.id);
    presets.push({ id: r.id, name, settings: sanitizeSettings(r.settings) });
  }
  return presets;
}
