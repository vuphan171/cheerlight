import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { DEFAULT_PREFS, DEFAULT_SETTINGS } from '@/configs/defaults';
import {
  cleanPresetName,
  duplicateName,
  findPresetByName,
  mostRecentPreset,
  newPresetId,
  PRESET_MAX,
} from '@/configs/presets';
import {
  resolveLastUsedId,
  sanitizePrefs,
  sanitizePresets,
  sanitizeSettings,
} from '@/configs/sanitize';
import { STORAGE_KEYS } from '@/configs/storage';
import { type RenameResult, SettingsContext } from '@/hooks/use-settings';
import type { AppPrefs, LightSettings, Preset } from '@/types/settings';

const SAVE_DEBOUNCE_MS = 300;

function persist(key: string, value: string | null) {
  const op = value === null ? AsyncStorage.removeItem(key) : AsyncStorage.setItem(key, value);
  op.catch((e: unknown) => console.warn(`[settings] save ${key} failed`, e));
}

function parseJson(raw: string | null, label: string): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[settings] stored ${label} corrupted, ignoring`, e);
    return undefined;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<LightSettings>(DEFAULT_SETTINGS);
  const [presets, setPresetsState] = useState<Preset[]>([]);
  const [lastUsedPresetId, setLastUsedPresetId] = useState<string | undefined>(undefined);
  const [nowPlaying, setNowPlaying] = useState<LightSettings | null>(null);
  const [prefs, setPrefs] = useState<AppPrefs>(DEFAULT_PREFS);
  const [strobeAccepted, setStrobeAccepted] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(Platform.OS !== 'web');

  // Bản sao đồng bộ của danh sách mẫu, để các hàm trả về kết quả ngay (trùng tên, đã đủ mẫu…).
  const presetsRef = useRef<Preset[]>([]);
  const setPresets = useCallback((next: Preset[]) => {
    presetsRef.current = next;
    setPresetsState(next);
  }, []);

  // Khôi phục dữ liệu đã lưu. Bản 1.0 chỉ có settings + strobe; các field mới được sanitize bổ sung.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([
      STORAGE_KEYS.settings,
      STORAGE_KEYS.strobeWarningAccepted,
      STORAGE_KEYS.presets,
      STORAGE_KEYS.lastUsedPresetId,
      STORAGE_KEYS.prefs,
    ])
      .then(([[, rawSettings], [, rawStrobe], [, rawPresets], [, rawLastUsed], [, rawPrefs]]) => {
        if (cancelled) return;
        const settingsJson = parseJson(rawSettings, 'settings');
        if (settingsJson !== undefined) setDraft(sanitizeSettings(settingsJson));
        const loadedPresets = sanitizePresets(parseJson(rawPresets, 'presets'));
        setPresets(loadedPresets);
        setLastUsedPresetId(resolveLastUsedId(rawLastUsed, loadedPresets));
        setPrefs(sanitizePrefs(parseJson(rawPrefs, 'prefs')));
        setStrobeAccepted(rawStrobe === 'true');
      })
      .catch((e: unknown) => console.warn('[settings] load failed', e))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [setPresets]);

  // Bản nháp: lưu (debounce) mỗi khi đổi; lưu ngay khi app rời foreground để không mất thay đổi cuối.
  const latestDraft = useRef(draft);
  useEffect(() => {
    latestDraft.current = draft;
    if (!loaded) return;
    const timer = setTimeout(() => persist(STORAGE_KEYS.settings, JSON.stringify(draft)), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') persist(STORAGE_KEYS.settings, JSON.stringify(latestDraft.current));
    });
    return () => sub.remove();
  }, [loaded]);

  // Mẫu, mẫu gần nhất, tuỳ chọn ít khi đổi → lưu ngay.
  useEffect(() => {
    if (loaded) persist(STORAGE_KEYS.presets, JSON.stringify(presets));
  }, [presets, loaded]);

  useEffect(() => {
    if (loaded) persist(STORAGE_KEYS.lastUsedPresetId, lastUsedPresetId ?? null);
  }, [lastUsedPresetId, loaded]);

  useEffect(() => {
    if (loaded) persist(STORAGE_KEYS.prefs, JSON.stringify(prefs));
  }, [prefs, loaded]);

  const updateDraft = useCallback((patch: Partial<LightSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => setDraft(DEFAULT_SETTINGS), []);

  const createPreset = useCallback(
    (name: string, settings: LightSettings) => {
      const cleaned = cleanPresetName(name);
      if (!cleaned) return null;
      const prev = presetsRef.current;
      const now = Date.now();
      const existing = findPresetByName(prev, cleaned);
      if (existing) {
        setPresets(
          prev.map((p) => (p.id === existing.id ? { ...p, name: cleaned, settings, updatedAt: now } : p)),
        );
        return existing.id;
      }
      if (prev.length >= PRESET_MAX) return null;
      const id = newPresetId();
      setPresets([...prev, { id, name: cleaned, settings, updatedAt: now }]);
      return id;
    },
    [setPresets],
  );

  const updatePresetSettings = useCallback(
    (id: string, settings: LightSettings) => {
      const now = Date.now();
      setPresets(presetsRef.current.map((p) => (p.id === id ? { ...p, settings, updatedAt: now } : p)));
    },
    [setPresets],
  );

  const renamePreset = useCallback(
    (id: string, name: string): RenameResult => {
      const cleaned = cleanPresetName(name);
      if (!cleaned) return 'empty';
      const prev = presetsRef.current;
      const clash = findPresetByName(prev, cleaned);
      if (clash && clash.id !== id) return 'duplicate';
      setPresets(prev.map((p) => (p.id === id ? { ...p, name: cleaned, updatedAt: Date.now() } : p)));
      return 'ok';
    },
    [setPresets],
  );

  const duplicatePreset = useCallback(
    (id: string) => {
      const prev = presetsRef.current;
      const source = prev.find((p) => p.id === id);
      if (!source || prev.length >= PRESET_MAX) return false;
      const copy: Preset = {
        id: newPresetId(),
        name: duplicateName(prev, source.name),
        settings: source.settings,
        updatedAt: Date.now(),
      };
      const index = prev.indexOf(source);
      setPresets([...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
      return true;
    },
    [setPresets],
  );

  const deletePreset = useCallback(
    (id: string) => {
      const next = presetsRef.current.filter((p) => p.id !== id);
      setPresets(next);
      setLastUsedPresetId((current) => (current === id ? mostRecentPreset(next)?.id : current));
    },
    [setPresets],
  );

  const play = useCallback((settings: LightSettings, presetId?: string) => {
    setNowPlaying(settings);
    if (presetId) setLastUsedPresetId(presetId);
  }, []);

  const updatePrefs = useCallback((patch: Partial<AppPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const acceptStrobe = useCallback(() => {
    setStrobeAccepted(true);
    persist(STORAGE_KEYS.strobeWarningAccepted, 'true');
  }, []);

  const resetStrobeWarning = useCallback(() => {
    setStrobeAccepted(false);
    persist(STORAGE_KEYS.strobeWarningAccepted, 'false');
  }, []);

  const markTorchUnavailable = useCallback(() => setTorchAvailable(false), []);

  const value = useMemo(
    () => ({
      loaded,
      draft,
      updateDraft,
      resetDraft,
      presets,
      createPreset,
      updatePresetSettings,
      renamePreset,
      duplicatePreset,
      deletePreset,
      lastUsedPresetId,
      nowPlaying,
      play,
      prefs,
      updatePrefs,
      strobeAccepted,
      acceptStrobe,
      resetStrobeWarning,
      torchAvailable,
      markTorchUnavailable,
    }),
    [
      loaded,
      draft,
      updateDraft,
      resetDraft,
      presets,
      createPreset,
      updatePresetSettings,
      renamePreset,
      duplicatePreset,
      deletePreset,
      lastUsedPresetId,
      nowPlaying,
      play,
      prefs,
      updatePrefs,
      strobeAccepted,
      acceptStrobe,
      resetStrobeWarning,
      torchAvailable,
      markTorchUnavailable,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
