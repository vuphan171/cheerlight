import { useCameraPermissions } from 'expo-camera';

import { useEffectChooser } from '@/components/strobe-warning';
import { settingsEqual } from '@/configs/presets';
import { useSettings } from '@/hooks/use-settings';
import type { Preset } from '@/types/settings';

/**
 * Áp dụng một mẫu đã lưu. Hiệu ứng đi qua `useEffectChooser` để vẫn chặn cảnh báo strobe;
 * flash chỉ bật khi máy hỗ trợ và đã có quyền Camera.
 * Trả về modal cảnh báo cần render và id của mẫu đang khớp với cài đặt hiện tại.
 */
export function useApplyPreset() {
  const { settings, updateSettings, presets, torchAvailable } = useSettings();
  const [permission] = useCameraPermissions();
  const { choose: chooseEffect, warning } = useEffectChooser((effect) => updateSettings({ effect }));

  const apply = (preset: Preset) => {
    const { effect, ...rest } = preset.settings;
    const torchEnabled = rest.torchEnabled && torchAvailable && permission?.granted === true;
    updateSettings({ ...rest, torchEnabled });
    chooseEffect(effect);
  };

  const activeId = presets.find((p) => settingsEqual(p.settings, settings))?.id ?? null;

  return { apply, activeId, warning };
}
