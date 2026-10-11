import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { RAINBOW_COLORS } from '@/configs/colors';
import { EFFECTS } from '@/configs/effects';
import {
  findPresetByName,
  PRESET_MAX,
  PRESET_NAME_MAX_LENGTH,
  suggestPresetName,
} from '@/configs/presets';
import { RADIUS, UI } from '@/configs/ui';
import { useApplyPreset } from '@/hooks/use-apply-preset';
import { useSettings } from '@/hooks/use-settings';
import type { Preset } from '@/types/settings';

function confirmDelete(preset: Preset, onConfirm: () => void) {
  const message = `Xoá mẫu "${preset.name}"?`;
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(message)) onConfirm();
    return;
  }
  Alert.alert('Xoá mẫu', message, [
    { text: 'Huỷ', style: 'cancel' },
    { text: 'Xoá', style: 'destructive', onPress: onConfirm },
  ]);
}

function describe(preset: Preset): string {
  const s = preset.settings;
  const parts = [EFFECTS.find((e) => e.mode === s.effect)?.label ?? s.effect];
  if (s.text.trim()) parts.push(`"${s.text.trim()}"`);
  if (s.torchEnabled) parts.push('⚡ Flash');
  return parts.join(' · ');
}

/** Mục "Mẫu đã lưu" ở màn hình cài đặt: danh sách mẫu, lưu mẫu mới, xoá mẫu. */
export function PresetManager() {
  const { presets, savePreset, deletePreset } = useSettings();
  const { apply, activeId, warning } = useApplyPreset();
  const [saving, setSaving] = useState(false);
  const full = presets.length >= PRESET_MAX;

  return (
    <>
      {presets.length === 0 ? (
        <Text style={styles.muted}>
          Chưa có mẫu nào. Chỉnh màu, hiệu ứng, chữ… rồi bấm “Lưu thành mẫu” để dùng lại nhanh.
        </Text>
      ) : (
        <View style={styles.list}>
          {presets.map((preset) => {
            const active = preset.id === activeId;
            return (
              <View key={preset.id} style={[styles.row, active && styles.rowActive]}>
                <Pressable
                  style={styles.rowMain}
                  accessibilityRole="button"
                  accessibilityLabel={`Áp dụng mẫu ${preset.name}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => apply(preset)}>
                  <Swatch preset={preset} />
                  <View style={styles.rowText}>
                    <Text style={styles.name} numberOfLines={1}>
                      {preset.name}
                    </Text>
                    <Text style={styles.detail} numberOfLines={1}>
                      {describe(preset)}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá mẫu ${preset.name}`}
                  hitSlop={8}
                  onPress={() => confirmDelete(preset, () => deletePreset(preset.id))}>
                  <Text style={styles.deleteLabel}>✕</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        style={styles.saveButton}
        accessibilityRole="button"
        onPress={() => setSaving(true)}>
        <Text style={styles.saveLabel}>＋ Lưu thành mẫu</Text>
      </Pressable>
      {full ? (
        <Text style={styles.hint}>
          Đã đủ {PRESET_MAX} mẫu — chỉ có thể ghi đè mẫu cũ (nhập trùng tên) hoặc xoá bớt.
        </Text>
      ) : null}

      <SavePresetModal
        visible={saving}
        presets={presets}
        onCancel={() => setSaving(false)}
        onSave={(name) => {
          savePreset(name);
          setSaving(false);
        }}
      />
      {warning}
    </>
  );
}

function Swatch({ preset }: { preset: Preset }) {
  const { backgroundColor, effect } = preset.settings;
  if (effect === 'rainbow') {
    return (
      <View style={[styles.swatch, styles.rainbow]}>
        {RAINBOW_COLORS.slice(0, -1).map((color, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </View>
    );
  }
  return <View style={[styles.swatch, { backgroundColor }]} />;
}

interface SavePresetModalProps {
  visible: boolean;
  presets: Preset[];
  onSave: (name: string) => void;
  onCancel: () => void;
}

function SavePresetModal({ visible, presets, onSave, onCancel }: SavePresetModalProps) {
  const [name, setName] = useState('');
  // Mỗi lần mở: điền sẵn tên gợi ý.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setName(suggestPresetName(presets));
  }

  const trimmed = name.trim();
  const existing = trimmed ? findPresetByName(presets, trimmed) : undefined;
  const full = presets.length >= PRESET_MAX;
  const canSave = trimmed.length > 0 && (existing !== undefined || !full);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>Lưu thành mẫu</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên mẫu"
            placeholderTextColor={UI.textMuted}
            maxLength={PRESET_NAME_MAX_LENGTH}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            onSubmitEditing={() => canSave && onSave(trimmed)}
            style={styles.input}
            accessibilityLabel="Tên mẫu"
          />
          {existing ? (
            <Text style={styles.hint}>Đã có mẫu “{existing.name}” — sẽ được cập nhật bằng cài đặt hiện tại.</Text>
          ) : full ? (
            <Text style={styles.hint}>Đã đủ {PRESET_MAX} mẫu. Nhập trùng tên để ghi đè, hoặc xoá bớt.</Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.buttonLabel}>Huỷ</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirm, !canSave && styles.disabled]}
              disabled={!canSave}
              accessibilityState={{ disabled: !canSave }}
              onPress={() => onSave(trimmed)}>
              <Text style={styles.buttonLabel}>{existing ? 'Ghi đè' : 'Lưu'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const SWATCH = 36;

const styles = StyleSheet.create({
  muted: { color: UI.textMuted, fontSize: 14, lineHeight: 20 },
  hint: { color: UI.textMuted, fontSize: 13, lineHeight: 18 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS,
    backgroundColor: UI.surfaceRaised,
    borderWidth: 1,
    borderColor: UI.border,
    paddingRight: 4,
  },
  rowActive: { borderColor: UI.accent },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  rowText: { flex: 1, gap: 2 },
  name: { color: UI.text, fontSize: 16, fontWeight: '600' },
  detail: { color: UI.textMuted, fontSize: 13 },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: SWATCH / 2,
    borderWidth: 1,
    borderColor: UI.border,
  },
  rainbow: { flexDirection: 'row', overflow: 'hidden' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 10 },
  deleteLabel: { color: UI.textMuted, fontSize: 16, fontWeight: '700' },
  saveButton: {
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: UI.accent,
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveLabel: { color: UI.text, fontSize: 15, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: UI.surface,
    borderRadius: RADIUS * 1.5,
    padding: 20,
    gap: 12,
  },
  title: { color: UI.text, fontSize: 18, fontWeight: '700' },
  input: {
    color: UI.text,
    backgroundColor: UI.surfaceRaised,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  button: { flex: 1, paddingVertical: 14, borderRadius: RADIUS, alignItems: 'center' },
  cancel: { backgroundColor: UI.surfaceRaised },
  confirm: { backgroundColor: UI.accent },
  disabled: { opacity: 0.4 },
  buttonLabel: { color: UI.text, fontSize: 15, fontWeight: '700' },
});
