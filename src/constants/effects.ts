import type { EffectMode } from '@/types/settings';

export const SPEED_MIN = 1;
export const SPEED_MAX = 10;

export const EFFECTS: readonly { mode: EffectMode; label: string }[] = [
  { mode: 'solid', label: 'Tĩnh' },
  { mode: 'blink', label: 'Nhấp nháy' },
  { mode: 'strobe', label: 'Strobe' },
  { mode: 'rainbow', label: 'Cầu vồng' },
];

/** Chu kỳ (ms) ở speed 1 và speed 10 cho từng chế độ. Một chu kỳ = một lần sáng + một lần tắt. */
const PERIOD_RANGE: Record<Exclude<EffectMode, 'solid'>, [slow: number, fast: number]> = {
  blink: [1000, 150],
  strobe: [200, 50],
  rainbow: [6000, 800],
};

/** Tỉ lệ thời gian sáng trong một chu kỳ. Strobe sáng ngắn, tắt dài. */
export const ON_RATIO: Record<'blink' | 'strobe', number> = {
  blink: 0.5,
  strobe: 0.3,
};

export function clampSpeed(speed: number): number {
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(speed)));
}

function lerpBySpeed(speed: number, [slow, fast]: readonly [number, number]): number {
  const t = (clampSpeed(speed) - SPEED_MIN) / (SPEED_MAX - SPEED_MIN);
  return Math.round(slow + (fast - slow) * t);
}

/** Quy đổi speed (1–10) ra chu kỳ ms. `solid` trả về 0. */
export function effectPeriodMs(effect: EffectMode, speed: number): number {
  if (effect === 'solid') return 0;
  return lerpBySpeed(speed, PERIOD_RANGE[effect]);
}

// ---- Torch (flash) ----

/** Tối đa 5 lần nháy/giây → chu kỳ tối thiểu 200ms. */
export const TORCH_MAX_FLASHES_PER_SECOND = 5;
export const TORCH_MIN_PERIOD_MS = 1000 / TORCH_MAX_FLASHES_PER_SECOND;
const TORCH_PERIOD_RANGE: [number, number] = [1000, TORCH_MIN_PERIOD_MS];

export function torchPeriodMs(rate: number): number {
  return Math.max(TORCH_MIN_PERIOD_MS, lerpBySpeed(rate, TORCH_PERIOD_RANGE));
}

/** Chu kỳ torch khi đồng bộ với hiệu ứng nền; luôn bị giới hạn ở mức tối đa cho phép. */
export function torchSyncPeriodMs(effect: EffectMode, speed: number): number | null {
  if (effect !== 'blink' && effect !== 'strobe') return null;
  return Math.max(TORCH_MIN_PERIOD_MS, effectPeriodMs(effect, speed));
}

// ---- Marquee ----

/** scrollSpeed (1–10) → pixel/giây. */
export function scrollPixelsPerSecond(scrollSpeed: number): number {
  return lerpBySpeed(scrollSpeed, [60, 900]);
}

export const FONT_SIZE_MIN = 40;
export const FONT_SIZE_MAX = 240;
