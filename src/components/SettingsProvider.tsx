import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { STORAGE_KEYS } from '@/constants/storage';
import { SettingsContext } from '@/hooks/useSettings';
import type { LightSettings } from '@/types/settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LightSettings>(DEFAULT_SETTINGS);
  const [strobeAccepted, setStrobeAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.strobeWarningAccepted)
      .then((v) => setStrobeAccepted(v === 'true'))
      .catch((e: unknown) => console.warn('[settings] load strobe consent failed', e));
  }, []);

  const updateSettings = useCallback((patch: Partial<LightSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const acceptStrobe = useCallback(() => {
    setStrobeAccepted(true);
    AsyncStorage.setItem(STORAGE_KEYS.strobeWarningAccepted, 'true').catch((e: unknown) =>
      console.warn('[settings] save strobe consent failed', e),
    );
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, loaded: true, strobeAccepted, acceptStrobe }),
    [settings, updateSettings, strobeAccepted, acceptStrobe],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
