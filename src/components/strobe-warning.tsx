import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Icon } from '@/components/ui/icon';
import { UI } from '@/configs/ui';
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
    <ConfirmDialog
      visible={visible}
      title="Cảnh báo động kinh do ánh sáng"
      icon={<Icon name="warning" size={34} color={UI.danger} style={styles.icon} />}
      onRequestClose={onCancel}
      actions={[
        { label: 'Huỷ', onPress: onCancel },
        { label: 'Tôi hiểu, tiếp tục', onPress: onAccept, kind: 'danger' },
      ]}>
      <Text style={styles.body}>
        Chế độ Strobe nhấp nháy rất nhanh và có thể gây co giật ở người bị động kinh nhạy cảm với
        ánh sáng (photosensitive epilepsy). Không dùng nếu bạn hoặc người xung quanh có tiền sử
        động kinh. Ngừng ngay nếu thấy chóng mặt, rối loạn thị giác hoặc co giật.
      </Text>
    </ConfirmDialog>
  );
}

const styles = StyleSheet.create({
  icon: { alignSelf: 'center', lineHeight: 38 },
  body: { fontSize: 14, lineHeight: 20, color: UI.label },
});
