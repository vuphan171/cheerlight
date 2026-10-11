import { normalizeHex } from '@/constants/colors';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, SPEED_MAX, SPEED_MIN } from '@/constants/effects';
import { TEXT_MAX_LENGTH } from '@/constants/fonts';
import type { LightSettings } from '@/types/settings';

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
