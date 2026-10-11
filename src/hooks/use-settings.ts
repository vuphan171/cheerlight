import { createContext, useContext } from 'react';

import { DEFAULT_SETTINGS } from '@/configs/defaults';
import type { LightSettings } from '@/types/settings';

export interface SettingsContextValue {
  settings: LightSettings;
  updateSettings: (patch: Partial<LightSettings>) => void;
  loaded: boolean;
  /** Người dùng đã đồng ý cảnh báo động kinh do ánh sáng (strobe). */
  strobeAccepted: boolean;
  acceptStrobe: () => void;
  /** `false` khi đã biết máy không dùng được camera/flash (CameraView báo lỗi mount). */
  torchAvailable: boolean;
  markTorchUnavailable: () => void;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  loaded: false,
  strobeAccepted: false,
  acceptStrobe: () => {},
  torchAvailable: true,
  markTorchUnavailable: () => {},
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
