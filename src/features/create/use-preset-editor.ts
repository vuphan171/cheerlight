import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { DEFAULT_SETTINGS } from '@/configs/defaults';
import { useSettings } from '@/hooks/use-settings';
import { useStrings } from '@/i18n';
import type { LightSettings } from '@/types/settings';

const usePresetEditor = (presetId?: string) => {
  const t = useStrings();
  const {
    draft,
    updateDraft,
    resetDraft,
    presets,
    createPreset,
    updatePresetSettings,
    deletePreset,
  } = useSettings();
  const editing = presetId ? presets.find((p) => p.id === presetId) : undefined;

  const [buffer, setBuffer] = useState<LightSettings>(editing?.settings ?? DEFAULT_SETTINGS);
  const [bufferFor, setBufferFor] = useState(editing?.id);
  if (editing && bufferFor !== editing.id) {
    setBufferFor(editing.id);
    setBuffer(editing.settings);
  } else if (!editing && bufferFor !== undefined) {
    setBufferFor(undefined);
  }

  useEffect(() => {
    if (presetId && !editing) router.setParams({ presetId: undefined });
  }, [presetId, editing]);

  const updateBuffer = useCallback((patch: Partial<LightSettings>) => {
    setBuffer((prev) => ({ ...prev, ...patch }));
  }, []);

  const settings = editing ? buffer : draft;
  const update = editing ? updateBuffer : updateDraft;

  const reset = () => {
    Alert.alert(t.create.reset, editing ? t.create.resetEditing : t.create.resetDraft, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.create.reset,
        style: 'destructive',
        onPress: () => (editing ? setBuffer(editing.settings) : resetDraft()),
      },
    ]);
  };

  const saveEditing = () => {
    if (!editing) return;
    updatePresetSettings(editing.id, buffer);
    router.navigate('/');
  };

  const saveDraftAs = (name: string) => {
    const saved = createPreset(name, draft) !== null;
    if (saved) router.navigate('/');
    return saved;
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t.presets.deletePreset, t.presets.deleteConfirm(editing.name), [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          deletePreset(editing.id);
          router.navigate('/');
        },
      },
    ]);
  };

  return { editing, presets, settings, update, reset, saveEditing, saveDraftAs, confirmDelete };
};

export { usePresetEditor };
