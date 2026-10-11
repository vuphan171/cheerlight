import { DEFAULT_SETTINGS } from '@/configs/defaults';
import type { LightSettings, Preset } from '@/types/settings';

export const PRESET_MAX = 20;
export const PRESET_NAME_MAX_LENGTH = 30;

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

export function newPresetId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof LightSettings)[];

export function settingsEqual(a: LightSettings, b: LightSettings): boolean {
  return SETTING_KEYS.every((key) => a[key] === b[key]);
}
