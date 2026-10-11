import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { SettingsContext } from '@/hooks/useSettings';
import type { LightSettings } from '@/types/settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LightSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((patch: Partial<LightSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, loaded: true }),
    [settings, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
