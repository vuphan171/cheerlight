import { createContext, useContext } from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaults';
import type { LightSettings } from '@/types/settings';

export interface SettingsContextValue {
  settings: LightSettings;
  updateSettings: (patch: Partial<LightSettings>) => void;
  loaded: boolean;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  loaded: false,
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
