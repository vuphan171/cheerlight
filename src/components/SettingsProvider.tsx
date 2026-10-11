import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { sanitizeSettings } from '@/constants/sanitize';
import { STORAGE_KEYS } from '@/constants/storage';
import { SettingsContext } from '@/hooks/useSettings';
import type { LightSettings } from '@/types/settings';

const SAVE_DEBOUNCE_MS = 300;

function save(settings: LightSettings) {
  AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)).catch((e: unknown) =>
    console.warn('[settings] save failed', e),
  );
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LightSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [strobeAccepted, setStrobeAccepted] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(Platform.OS !== 'web');

  // Khôi phục cài đặt + trạng thái đồng ý cảnh báo strobe.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([STORAGE_KEYS.settings, STORAGE_KEYS.strobeWarningAccepted])
      .then(([[, rawSettings], [, rawStrobe]]) => {
        if (cancelled) return;
        if (rawSettings) {
          try {
            setSettings(sanitizeSettings(JSON.parse(rawSettings)));
          } catch (e) {
            console.warn('[settings] stored settings corrupted, using defaults', e);
          }
        }
        setStrobeAccepted(rawStrobe === 'true');
      })
      .catch((e: unknown) => console.warn('[settings] load failed', e))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Lưu (debounce) mỗi khi đổi; lưu ngay khi app rời foreground để không mất thay đổi cuối.
  const latest = useRef(settings);
  useEffect(() => {
    latest.current = settings;
    if (!loaded) return;
    const timer = setTimeout(() => save(settings), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [settings, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') save(latest.current);
    });
    return () => sub.remove();
  }, [loaded]);

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
      loaded,
      strobeAccepted,
      acceptStrobe,
      torchAvailable,
      markTorchUnavailable,
    }),
    [settings, updateSettings, loaded, strobeAccepted, acceptStrobe, torchAvailable, markTorchUnavailable],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
