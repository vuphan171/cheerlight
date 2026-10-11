import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, UI } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';
import type { EffectMode } from '@/types/settings';

/**
 * Trả về hàm chọn hiệu ứng có chặn cảnh báo động kinh do ánh sáng lần đầu chọn `strobe`,
 * và phần tử modal cần render.
 */
export function useEffectChooser(onChange: (mode: EffectMode) => void) {
  const { strobeAccepted, acceptStrobe } = useSettings();
  const [pending, setPending] = useState(false);

  const choose = (mode: EffectMode) => {
    if (mode === 'strobe' && !strobeAccepted) {
      setPending(true);
      return;
    }
    onChange(mode);
  };

  const warning = (
    <StrobeWarningModal
      visible={pending}
      onAccept={() => {
        acceptStrobe();
        setPending(false);
        onChange('strobe');
      }}
      onCancel={() => setPending(false)}
    />
  );

  return { choose, warning };
}

interface StrobeWarningModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

function StrobeWarningModal({ visible, onAccept, onCancel }: StrobeWarningModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Cảnh báo động kinh do ánh sáng</Text>
          <Text style={styles.body}>
            Chế độ Strobe nhấp nháy rất nhanh và có thể gây co giật ở người bị động kinh nhạy cảm
            với ánh sáng (photosensitive epilepsy). Không dùng nếu bạn hoặc người xung quanh có
            tiền sử động kinh. Ngừng ngay nếu thấy chóng mặt, rối loạn thị giác hoặc co giật.
          </Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.buttonLabel}>Huỷ</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.accept]} onPress={onAccept}>
              <Text style={styles.buttonLabel}>Tôi hiểu, tiếp tục</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  icon: { fontSize: 32, textAlign: 'center' },
  title: { color: UI.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  body: { color: UI.textMuted, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { flex: 1, paddingVertical: 14, borderRadius: RADIUS, alignItems: 'center' },
  cancel: { backgroundColor: UI.surfaceRaised },
  accept: { backgroundColor: UI.danger },
  buttonLabel: { color: UI.text, fontSize: 15, fontWeight: '700' },
});
