import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ConfirmDialog, dialogInputStyle } from '@/components/ui/confirm-dialog';
import { normalizeHex } from '@/configs/colors';
import { UI } from '@/configs/ui';

interface HexColorSheetProps {
  visible: boolean;
  value: string;
  onSubmit: (hex: string) => void;
  onClose: () => void;
}

/** Nhập mã màu hex. Báo lỗi ngay khi gõ; xem trước là giá trị hợp lệ gần nhất. */
export function HexColorSheet({ visible, value, onSubmit, onClose }: HexColorSheetProps) {
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
      title="Màu tuỳ chỉnh"
      onRequestClose={onClose}
      actions={[
        { label: 'Huỷ', onPress: onClose },
        {
          label: 'Dùng màu',
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
          accessibilityLabel="Mã màu hex"
        />
      </View>
      <Text style={[styles.hint, invalid && styles.error]}>
        {invalid ? 'Mã không hợp lệ. Dùng dạng #RGB hoặc #RRGGBB.' : 'Ví dụ: #FF2FD6 hoặc #F2D'}
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
