import { createContext, useContext } from 'react';

import { DEFAULT_PREFS, DEFAULT_SETTINGS } from '@/configs/defaults';
import type { AppPrefs, LightSettings, Preset } from '@/types/settings';

export type RenameResult = 'ok' | 'duplicate' | 'empty';

export interface SettingsContextValue {
  loaded: boolean;

  /** Bản nháp ở tab Tạo (chế độ tạo mới). Được lưu lại giữa các lần mở app. */
  draft: LightSettings;
  updateDraft: (patch: Partial<LightSettings>) => void;
  resetDraft: () => void;

  presets: Preset[];
  /** Tạo mẫu mới; trùng tên (không phân biệt hoa thường) thì ghi đè mẫu đó. Trả về id, hoặc `null` khi đã đủ mẫu. */
  createPreset: (name: string, settings: LightSettings) => string | null;
  updatePresetSettings: (id: string, settings: LightSettings) => void;
  renamePreset: (id: string, name: string) => RenameResult;
  /** Trả về `false` khi đã đủ mẫu. */
  duplicatePreset: (id: string) => boolean;
  deletePreset: (id: string) => void;
  lastUsedPresetId: string | undefined;

  /** Cài đặt màn Phát đang chạy (chỉ trong RAM, không ghi đè bản nháp). */
  nowPlaying: LightSettings | null;
  play: (settings: LightSettings, presetId?: string) => void;

  prefs: AppPrefs;
  updatePrefs: (patch: Partial<AppPrefs>) => void;

  strobeAccepted: boolean;
  acceptStrobe: () => void;
  resetStrobeWarning: () => void;

  /** `false` khi đã biết máy không dùng được camera/flash (CameraView báo lỗi mount). */
  torchAvailable: boolean;
  markTorchUnavailable: () => void;
}

const noop = () => {};

export const SettingsContext = createContext<SettingsContextValue>({
  loaded: false,
  draft: DEFAULT_SETTINGS,
  updateDraft: noop,
  resetDraft: noop,
  presets: [],
  createPreset: () => null,
  updatePresetSettings: noop,
  renamePreset: () => 'empty',
  duplicatePreset: () => false,
  deletePreset: noop,
  lastUsedPresetId: undefined,
  nowPlaying: null,
  play: noop,
  prefs: DEFAULT_PREFS,
  updatePrefs: noop,
  strobeAccepted: false,
  acceptStrobe: noop,
  resetStrobeWarning: noop,
  torchAvailable: true,
  markTorchUnavailable: noop,
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
