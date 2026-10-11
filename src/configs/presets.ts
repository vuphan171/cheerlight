import { DEFAULT_SETTINGS } from '@/configs/defaults';
import type { Strings } from '@/i18n';
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

/** Tên gợi ý "Preset N" / "Mẫu N" chưa bị dùng. */
export function suggestPresetName(presets: readonly Preset[], t: Strings): string {
  for (let n = presets.length + 1; ; n++) {
    const name = t.presets.suggestedName(n);
    if (!findPresetByName(presets, name)) return name;
  }
}

/** "Tên (copy)", rồi "(copy 2)"… Cắt bớt tên gốc để vừa giới hạn độ dài. */
export function duplicateName(presets: readonly Preset[], name: string, t: Strings): string {
  for (let n = 1; ; n++) {
    const suffix = t.presets.copySuffix(n);
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

export function effectLabel(effect: LightSettings['effect'], t: Strings): string {
  return t.effects[effect].label;
}

/** Tóm tắt một dòng, vd. "Blink · ⚡ Flash". */
export function presetSummary(s: LightSettings, t: Strings): string {
  const parts = [effectLabel(s.effect, t)];
  if (s.torchEnabled) parts.push('⚡ Flash');
  return parts.join(' · ');
}
