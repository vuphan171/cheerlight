import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { DEFAULT_SETTINGS } from '@/configs/defaults';
import {
  findPresetByName,
  newPresetId,
  PRESET_MAX,
  PRESET_NAME_MAX_LENGTH,
} from '@/configs/presets';
import { sanitizePresets, sanitizeSettings } from '@/configs/sanitize';
import { STORAGE_KEYS } from '@/configs/storage';
import { SettingsContext } from '@/hooks/use-settings';
import type { LightSettings, Preset } from '@/types/settings';

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
  const [presets, setPresets] = useState<Preset[]>([]);

  // Khôi phục cài đặt, danh sách mẫu + trạng thái đồng ý cảnh báo strobe.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([STORAGE_KEYS.settings, STORAGE_KEYS.strobeWarningAccepted, STORAGE_KEYS.presets])
      .then(([[, rawSettings], [, rawStrobe], [, rawPresets]]) => {
        if (cancelled) return;
        if (rawSettings) {
          try {
            setSettings(sanitizeSettings(JSON.parse(rawSettings)));
          } catch (e) {
            console.warn('[settings] stored settings corrupted, using defaults', e);
          }
        }
        if (rawPresets) {
          try {
            setPresets(sanitizePresets(JSON.parse(rawPresets)));
          } catch (e) {
            console.warn('[settings] stored presets corrupted, ignoring', e);
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

  // Mẫu ít khi đổi → lưu ngay, không debounce.
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(presets)).catch((e: unknown) =>
      console.warn('[settings] save presets failed', e),
    );
  }, [presets, loaded]);

  const savePreset = useCallback((name: string) => {
    const trimmed = name.trim().replace(/\s+/g, ' ').slice(0, PRESET_NAME_MAX_LENGTH);
    if (!trimmed) return;
    const current = latest.current;
    setPresets((prev) => {
      const existing = findPresetByName(prev, trimmed);
      if (existing) {
        return prev.map((p) => (p.id === existing.id ? { ...p, name: trimmed, settings: current } : p));
      }
      if (prev.length >= PRESET_MAX) return prev;
      return [...prev, { id: newPresetId(), name: trimmed, settings: current }];
    });
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
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
      loaded,
      strobeAccepted,
      acceptStrobe,
      torchAvailable,
      markTorchUnavailable,
      presets,
      savePreset,
      deletePreset,
    }),
    [
      settings,
      updateSettings,
      loaded,
      strobeAccepted,
      acceptStrobe,
      torchAvailable,
      markTorchUnavailable,
      presets,
      savePreset,
      deletePreset,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
