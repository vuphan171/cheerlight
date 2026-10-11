import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import { type SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ON_RATIO, type TorchPlan, torchPlan } from '@/constants/effects';
import type { LightSettings } from '@/types/settings';

interface TorchControllerProps {
  settings: LightSettings;
  /** Đồng hồ hiệu ứng nền (0 → 1 mỗi chu kỳ), dùng khi flash đồng bộ với `blink`. */
  progress: SharedValue<number>;
  /** `false` khi màn hình không focus → tháo CameraView, flash tắt chắc chắn. */
  active: boolean;
  onUnavailable: () => void;
}

/** Theo dõi app có đang ở foreground không. */
function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

/**
 * Điều khiển đèn flash qua `CameraView` ẩn (1×1, trong suốt).
 *
 * CameraView chỉ được mount khi: đã bật flash, có quyền camera, màn hình đang focus và app ở
 * foreground. Rời màn hình / vào background / unmount → CameraView bị tháo → phiên camera dừng
 * → flash tắt trên cả iOS và Android, kể cả khi JS không kịp gửi `enableTorch=false`.
 */
export function TorchController({ settings, progress, active, onUnavailable }: TorchControllerProps) {
  const [permission] = useCameraPermissions();
  const appActive = useAppActive();
  const plan = torchPlan(settings);

  const shouldMount =
    Platform.OS !== 'web' &&
    plan.kind !== 'off' &&
    permission?.granted === true &&
    active &&
    appActive;

  if (!shouldMount) return null;
  return <TorchCamera plan={plan} progress={progress} onUnavailable={onUnavailable} />;
}

interface TorchCameraProps {
  plan: Exclude<TorchPlan, { kind: 'off' }>;
  progress: SharedValue<number>;
  onUnavailable: () => void;
}

function TorchCamera({ plan, progress, onUnavailable }: TorchCameraProps) {
  const [on, setOn] = useState(plan.kind !== 'timer');
  const periodMs = plan.kind === 'timer' ? plan.periodMs : 0;

  // Nháy theo nhịp riêng. Đây là bật/tắt một prop native (tối đa 5 lần/giây), không phải nháy
  // màu, nên dùng timer JS là hợp lý; chỉ component nhỏ này re-render.
  useEffect(() => {
    if (plan.kind !== 'timer') return;
    let next = true;
    const tick = () => {
      setOn(next);
      next = !next;
      timer = setTimeout(tick, periodMs / 2);
    };
    let timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [plan.kind, periodMs]);

  // Đồng bộ với blink: chỉ báo về JS khi trạng thái sáng/tắt đổi (≤ 2 lần mỗi chu kỳ blink,
  // và plan 'follow' chỉ được chọn khi chu kỳ ≥ 200ms).
  const follow = plan.kind === 'follow';
  useAnimatedReaction(
    () => (follow ? progress.get() < ON_RATIO.blink : null),
    (lit, prev) => {
      if (lit !== null && lit !== prev) scheduleOnRN(setOn, lit);
    },
    [follow],
  );

  return (
    <CameraView
      style={styles.hidden}
      facing="back"
      enableTorch={plan.kind === 'steady' || on}
      animateShutter={false}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onMountError={(e) => {
        console.warn('[torch] camera mount error', e.message);
        // iOS báo "session was reset" khi media services khởi động lại — lỗi tạm thời, tự phục hồi.
        if (!/session was reset/i.test(e.message)) onUnavailable();
      }}
    />
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, left: 0, top: 0 },
});
