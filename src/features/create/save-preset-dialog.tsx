import type React from 'react';

import { NameDialog } from '@/components/name-dialog';
import { findPresetByName, PRESET_MAX, suggestPresetName } from '@/configs/presets';
import { useStrings } from '@/i18n';
import type { Preset } from '@/types/settings';

interface Props {
  visible: boolean;
  presets: Preset[];
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

const SavePresetDialog: React.FC<Props> = ({ visible, presets, onCancel, onSubmit }) => {
  const t = useStrings();

  const validate = (name: string) => {
    const existing = findPresetByName(presets, name);
    if (existing) return { hint: t.create.overwriteHint(existing.name) };
    if (presets.length >= PRESET_MAX) return { error: t.create.fullError(PRESET_MAX) };
    return {};
  };

  return (
    <NameDialog
      visible={visible}
      title={t.create.saveAs}
      initialName={suggestPresetName(presets, t)}
      confirmLabel={(name) =>
        findPresetByName(presets, name) ? t.create.overwrite : t.common.save
      }
      validate={validate}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

export { SavePresetDialog };
