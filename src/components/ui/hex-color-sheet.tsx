import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ConfirmDialog, dialogInputStyle } from '@/components/ui/confirm-dialog';
import { normalizeHex } from '@/configs/colors';
import { UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

interface HexColorSheetProps {
  visible: boolean;
  value: string;
  onSubmit: (hex: string) => void;
  onClose: () => void;
}

export function HexColorSheet({ visible, value, onSubmit, onClose }: HexColorSheetProps) {
  const t = useStrings();
  const [text, setText] = useState(value);
  const [lastValid, setLastValid] = useState(value);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setText(value);
      setLastValid(value);
    }
  }

  const normalized = normalizeHex(text);
  const invalid = text.trim().length > 0 && normalized === null;

  const onChangeText = (next: string) => {
    setText(next);
    const hex = normalizeHex(next);
    if (hex) setLastValid(hex);
  };

  return (
    <ConfirmDialog
      visible={visible}
      title={t.color.custom}
      onRequestClose={onClose}
      actions={[
        { label: t.common.cancel, onPress: onClose },
        {
          label: t.color.use,
          kind: 'primary',
          disabled: normalized === null,
          onPress: () => {
            if (normalized) onSubmit(normalized);
          },
        },
      ]}>
      <View style={styles.row}>
        <View style={[styles.preview, { backgroundColor: lastValid }]} />
        <TextInput
          value={text}
          onChangeText={onChangeText}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          maxLength={7}
          placeholder="#RRGGBB"
          placeholderTextColor={UI.secondary}
          returnKeyType="done"
          onSubmitEditing={() => normalized && onSubmit(normalized)}
          style={[dialogInputStyle, styles.input, invalid && styles.inputInvalid]}
        />
      </View>
      <Text style={[styles.hint, invalid && styles.error]}>
        {invalid ? t.color.hexInvalid : t.color.hexExample}
      </Text>
    </ConfirmDialog>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  preview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.separator,
  },
  input: { flex: 1, fontVariant: ['tabular-nums'] },
  inputInvalid: { borderColor: UI.danger },
  hint: { fontSize: 13, color: UI.secondary },
  error: { color: UI.danger },
});
