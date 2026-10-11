import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { STORAGE_KEYS } from '@/constants/storage';
import { SettingsContext } from '@/hooks/useSettings';
import type { LightSettings } from '@/types/settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LightSettings>(DEFAULT_SETTINGS);
  const [strobeAccepted, setStrobeAccepted] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(Platform.OS !== 'web');

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

  const markTorchUnavailable = useCallback(() => {
    setTorchAvailable(false);
    setSettings((prev) => (prev.torchEnabled ? { ...prev, torchEnabled: false } : prev));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      loaded: true,
      strobeAccepted,
      acceptStrobe,
      torchAvailable,
      markTorchUnavailable,
    }),
    [settings, updateSettings, strobeAccepted, acceptStrobe, torchAvailable, markTorchUnavailable],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
