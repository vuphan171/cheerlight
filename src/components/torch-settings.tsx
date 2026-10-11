import { useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import {
  AppState,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Segmented } from '@/components/segmented';
import { SpeedSlider } from '@/components/speed-slider';
import { TORCH_MAX_FLASHES_PER_SECOND, torchPeriodMs } from '@/configs/effects';
import { RADIUS, UI } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';
import type { TorchMode } from '@/types/settings';

const MODES: readonly { value: TorchMode; label: string }[] = [
  { value: 'steady', label: 'Sáng liên tục' },
  { value: 'blink', label: 'Nháy' },
];

function flashesPerSecond(rate: number): string {
  return `${(1000 / torchPeriodMs(rate)).toFixed(1)} lần/giây`;
}

export function TorchSettings() {
  const { settings, updateSettings, torchAvailable } = useSettings();
  const [permission, requestPermission, getPermission] = useCameraPermissions();

  // Người dùng có thể vừa cấp quyền trong Cài đặt rồi quay lại app.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  const granted = permission?.granted === true;
  const blocked = permission !== null && !granted && !permission.canAskAgain;

  // Mất quyền (vd. thu hồi trong Cài đặt) → tắt flash.
  useEffect(() => {
    if (permission && !granted && settings.torchEnabled) updateSettings({ torchEnabled: false });
  }, [permission, granted, settings.torchEnabled, updateSettings]);

  if (Platform.OS === 'web' || !torchAvailable) {
    return <Text style={styles.muted}>Thiết bị này không hỗ trợ điều khiển đèn flash.</Text>;
  }

  if (blocked) {
    return (
      <View style={styles.blocked}>
        <Text style={styles.muted}>
          Đèn flash cần quyền Camera nhưng quyền đã bị từ chối. Mở Cài đặt → CheerLight → bật
          Camera để dùng tính năng này.
        </Text>
        <Pressable style={styles.settingsButton} onPress={() => void Linking.openSettings()}>
          <Text style={styles.settingsLabel}>Mở Cài đặt</Text>
        </Pressable>
      </View>
    );
  }

  const toggle = async (value: boolean) => {
    if (!value) {
      updateSettings({ torchEnabled: false });
      return;
    }
    // Bỏ focus ô nhập chữ, nếu không Android sẽ bật lại bàn phím sau khi đóng hộp thoại quyền.
    Keyboard.dismiss();
    const result = granted ? permission : await requestPermission();
    if (result?.granted) updateSettings({ torchEnabled: true });
  };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Bật đèn flash</Text>
          {!granted ? <Text style={styles.hint}>Sẽ xin quyền Camera (chỉ để bật flash).</Text> : null}
        </View>
        <Switch
          value={settings.torchEnabled}
          onValueChange={(v) => void toggle(v)}
          trackColor={{ true: UI.accent, false: UI.surfaceRaised }}
          accessibilityLabel="Bật đèn flash"
        />
      </View>

      {settings.torchEnabled ? (
        <>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Đồng bộ với hiệu ứng nền</Text>
              <Text style={styles.hint}>
                Nháy theo nhịp Nháy/Strobe (Strobe tự hạ xuống tối đa{' '}
                {TORCH_MAX_FLASHES_PER_SECOND} lần/giây). Tĩnh/Cầu vồng: sáng liên tục.
              </Text>
            </View>
            <Switch
              value={settings.torchSyncWithEffect}
              onValueChange={(torchSyncWithEffect) => updateSettings({ torchSyncWithEffect })}
              trackColor={{ true: UI.accent, false: UI.surfaceRaised }}
              accessibilityLabel="Đồng bộ flash với hiệu ứng nền"
            />
          </View>

          {!settings.torchSyncWithEffect ? (
            <>
              <Segmented
                options={MODES}
                value={settings.torchMode}
                onChange={(torchMode) => updateSettings({ torchMode })}
              />
              {settings.torchMode === 'blink' ? (
                <SpeedSlider
                  label="Nhịp nháy flash"
                  value={settings.torchRate}
                  onChange={(torchRate) => updateSettings({ torchRate })}
                  formatValue={flashesPerSecond}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, gap: 2 },
  label: { color: UI.text, fontSize: 16 },
  hint: { color: UI.textMuted, fontSize: 13, lineHeight: 18 },
  muted: { color: UI.textMuted, fontSize: 14, lineHeight: 20 },
  blocked: { gap: 12 },
  settingsButton: {
    alignSelf: 'flex-start',
    backgroundColor: UI.surfaceRaised,
    borderRadius: RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  settingsLabel: { color: UI.text, fontWeight: '700' },
});
