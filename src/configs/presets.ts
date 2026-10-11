import { DEFAULT_SETTINGS } from '@/configs/defaults';
import { EFFECTS } from '@/configs/effects';
import type { LightSettings, Preset } from '@/types/settings';

export const PRESET_MAX = 20;
export const PRESET_NAME_MAX_LENGTH = 30;

/** Bỏ khoảng trắng thừa, cắt theo độ dài tối đa. */
export function cleanPresetName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, PRESET_NAME_MAX_LENGTH).trim();
}

/** Khoá so sánh tên mẫu: bỏ khoảng trắng thừa, không phân biệt hoa thường. */
export function presetNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function findPresetByName(presets: readonly Preset[], name: string): Preset | undefined {
  const key = presetNameKey(name);
  return presets.find((p) => presetNameKey(p.name) === key);
}

/** Tên gợi ý "Mẫu N" chưa bị dùng. */
export function suggestPresetName(presets: readonly Preset[]): string {
  for (let n = presets.length + 1; ; n++) {
    const name = `Mẫu ${n}`;
    if (!findPresetByName(presets, name)) return name;
  }
}

/** "Tên (bản sao)", rồi "(bản sao 2)"… Cắt bớt tên gốc để vừa giới hạn độ dài. */
export function duplicateName(presets: readonly Preset[], name: string): string {
  for (let n = 1; ; n++) {
    const suffix = n === 1 ? ' (bản sao)' : ` (bản sao ${n})`;
    const base = name.slice(0, Math.max(1, PRESET_NAME_MAX_LENGTH - suffix.length)).trim();
    const candidate = `${base}${suffix}`;
    if (!findPresetByName(presets, candidate)) return candidate;
  }
}

/** Mẫu cập nhật gần nhất (dùng làm "Dùng gần nhất" khi chưa có hoặc mẫu cũ bị xoá). */
export function mostRecentPreset(presets: readonly Preset[]): Preset | undefined {
  let best: Preset | undefined;
  for (const p of presets) if (!best || p.updatedAt > best.updatedAt) best = p;
  return best;
}

export function newPresetId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof LightSettings)[];

export function settingsEqual(a: LightSettings, b: LightSettings): boolean {
  return SETTING_KEYS.every((key) => a[key] === b[key]);
}

export function effectLabel(effect: LightSettings['effect']): string {
  return EFFECTS.find((e) => e.mode === effect)?.label ?? effect;
}

/** Tóm tắt một dòng, vd. "Nháy · ⚡ Flash". */
export function presetSummary(s: LightSettings): string {
  const parts = [effectLabel(s.effect)];
  if (s.torchEnabled) parts.push('⚡ Flash');
  return parts.join(' · ');
}
