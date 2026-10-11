import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { normalizeHex, PRESET_COLORS } from '@/constants/colors';
import { RADIUS, UI } from '@/constants/ui';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const draftValid = normalizeHex(draft) !== null;

  const commitDraft = (text: string) => {
    const hex = normalizeHex(text);
    if (hex) onChange(hex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {PRESET_COLORS.map((color) => {
          const selected = color.toUpperCase() === value.toUpperCase();
          return (
            <Pressable
              key={color}
              accessibilityRole="button"
              accessibilityLabel={`Màu ${color}`}
              accessibilityState={{ selected }}
              onPress={() => {
                onChange(color);
                setDraft(color);
              }}
              style={[styles.swatch, { backgroundColor: color }, selected && styles.swatchSelected]}
            />
          );
        })}
      </View>
      <View style={styles.hexRow}>
        <View style={[styles.preview, { backgroundColor: value }]} />
        <TextInput
          // Khi không gõ thì hiển thị đúng giá trị hiện tại (có thể vừa đổi từ preset/thanh nổi).
          value={editing ? draft : value}
          onFocus={() => {
            setDraft(value);
            setEditing(true);
          }}
          onBlur={() => setEditing(false)}
          onChangeText={(text) => {
            setDraft(text);
            commitDraft(text);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          placeholder="#RRGGBB"
          placeholderTextColor={UI.textMuted}
          style={[styles.hexInput, editing && !draftValid && styles.hexInputInvalid]}
          accessibilityLabel="Mã màu hex"
        />
      </View>
      {editing && !draftValid ? (
        <Text style={styles.error}>Mã màu không hợp lệ. Dùng dạng #RGB hoặc #RRGGBB.</Text>
      ) : null}
    </View>
  );
}

const SWATCH = 40;

const styles = StyleSheet.create({
  container: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: UI.text, transform: [{ scale: 1.1 }] },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preview: { width: SWATCH, height: SWATCH, borderRadius: 8, borderWidth: 1, borderColor: UI.border },
  hexInput: {
    flex: 1,
    color: UI.text,
    backgroundColor: UI.surfaceRaised,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  hexInputInvalid: { borderColor: UI.danger },
  error: { color: UI.danger, fontSize: 13 },
});
