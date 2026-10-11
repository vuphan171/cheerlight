import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { ConfirmDialog, dialogInputStyle } from '@/components/ui/confirm-dialog';
import { PRESET_NAME_MAX_LENGTH } from '@/configs/presets';
import { UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

interface NameDialogProps {
  visible: boolean;
  title: string;
  initialName: string;
  confirmLabel: (name: string) => string;
  /** Chú thích dưới ô nhập: `error` chặn nút xác nhận, `hint` chỉ để báo. */
  validate: (name: string) => { error?: string; hint?: string };
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NameDialog({
  visible,
  title,
  initialName,
  confirmLabel,
  validate,
  onSubmit,
  onCancel,
}: NameDialogProps) {
  const t = useStrings();
  const [name, setName] = useState(initialName);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setName(initialName);
  }

  const trimmed = name.trim();
  const { error, hint } = trimmed ? validate(trimmed) : { error: undefined, hint: undefined };
  const canSubmit = trimmed.length > 0 && !error;

  return (
    <ConfirmDialog
      visible={visible}
      title={title}
      onRequestClose={onCancel}
      actions={[
        { label: t.common.cancel, onPress: onCancel },
        {
          label: confirmLabel(trimmed),
          kind: 'primary',
          disabled: !canSubmit,
          onPress: () => onSubmit(trimmed),
        },
      ]}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.presets.namePlaceholder}
        placeholderTextColor={UI.secondary}
        maxLength={PRESET_NAME_MAX_LENGTH}
        autoFocus
        selectTextOnFocus
        returnKeyType="done"
        onSubmitEditing={() => canSubmit && onSubmit(trimmed)}
        style={[dialogInputStyle, error ? styles.invalid : null]}
      />
      <Text style={[styles.note, error ? styles.error : null]}>
        {error ?? hint ?? `${name.length}/${PRESET_NAME_MAX_LENGTH}`}
      </Text>
    </ConfirmDialog>
  );
}

const styles = StyleSheet.create({
  invalid: { borderColor: UI.danger },
  note: { fontSize: 13, lineHeight: 18, color: UI.secondary },
  error: { color: UI.danger },
});
