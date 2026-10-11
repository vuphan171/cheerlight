import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { EditorTabProps } from '@/components/create/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GroupedSection } from '@/components/ui/grouped-section';
import { ListRow } from '@/components/ui/list-row';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { SPEED_MAX, SPEED_MIN, TORCH_MAX_FLASHES_PER_SECOND, torchPeriodMs } from '@/configs/effects';
import { ICON_BG, TYPE, UI } from '@/configs/ui';
import { useTorchPermission } from '@/hooks/use-torch-permission';
import type { TorchMode } from '@/types/settings';

const MODES: readonly { value: TorchMode; label: string }[] = [
  { value: 'steady', label: 'Sáng liên tục' },
  { value: 'blink', label: 'Nháy' },
];

export const FLASH_NOTE = `Flash nháy tối đa ${TORCH_MAX_FLASHES_PER_SECOND} lần/giây. Với Tĩnh và Cầu vồng, flash sáng liên tục.`;

function flashesPerSecond(rate: number): string {
  return `${(1000 / torchPeriodMs(rate)).toFixed(1).replace('.', ',')} lần/giây`;
}

export function FlashTab({ settings, update }: EditorTabProps) {
  const { status, granted, ensure, openSettings } = useTorchPermission();
  const [rateOpen, setRateOpen] = useState(false);

  // Mất quyền (vd. thu hồi trong Cài đặt) → tắt flash.
  useEffect(() => {
    if (status !== 'granted' && status !== 'undetermined' && settings.torchEnabled) {
      update({ torchEnabled: false });
    }
  }, [status, settings.torchEnabled, update]);

  if (status === 'unavailable') {
    return (
      <GroupedSection label="Đèn flash" list={false}>
        <Text style={styles.muted}>Thiết bị này không hỗ trợ điều khiển đèn flash.</Text>
      </GroupedSection>
    );
  }

  if (status === 'blocked') {
    return (
      <GroupedSection
        label="Đèn flash"
        footer="Đèn flash cần quyền Camera nhưng quyền đã bị từ chối. Mở Cài đặt → CheerLight → bật Camera.">
        <ListRow
          title="Quyền Camera"
          icon={{ name: 'camera', color: ICON_BG.gray }}
          value="Bị chặn"
          chevron
          onPress={openSettings}
        />
        <ListRow title="Mở Cài đặt" titleColor={UI.accent} onPress={openSettings} last />
      </GroupedSection>
    );
  }

  const toggleTorch = async (value: boolean) => {
    if (!value) {
      update({ torchEnabled: false });
      return;
    }
    if (await ensure()) update({ torchEnabled: true });
  };

  const enabled = settings.torchEnabled && granted;
  const rateValue =
    settings.torchMode === 'steady' ? 'Sáng liên tục' : `Nháy · ${flashesPerSecond(settings.torchRate)}`;

  return (
    <>
      <GroupedSection
        label="Đèn flash"
        footer={granted ? FLASH_NOTE : `Sẽ xin quyền Camera (chỉ để bật flash). ${FLASH_NOTE}`}>
        <ListRow
          title="Bật đèn flash"
          icon={{ name: 'flash', color: ICON_BG.orange }}
          accessory={
            <Toggle value={enabled} onValueChange={(v) => void toggleTorch(v)} accessibilityLabel="Bật đèn flash" />
          }
          last={!enabled}
        />
        {enabled ? (
          <ListRow
            title="Nháy theo hiệu ứng"
            icon={{ name: 'pulse', color: ICON_BG.blue }}
            accessory={
              <Toggle
                value={settings.torchSyncWithEffect}
                onValueChange={(torchSyncWithEffect) => update({ torchSyncWithEffect })}
                accessibilityLabel="Flash nháy theo hiệu ứng nền"
              />
            }
            last={settings.torchSyncWithEffect}
          />
        ) : null}
        {enabled && !settings.torchSyncWithEffect ? (
          <ListRow
            title="Nhịp riêng"
            icon={{ name: 'time', color: ICON_BG.gray }}
            value={rateValue}
            chevron
            onPress={() => setRateOpen(true)}
            last
          />
        ) : null}
      </GroupedSection>

      <ConfirmDialog
        visible={rateOpen}
        title="Nhịp riêng của flash"
        onRequestClose={() => setRateOpen(false)}
        actions={[{ label: 'Xong', kind: 'primary', onPress: () => setRateOpen(false) }]}>
        <View style={styles.rateBody}>
          <SegmentedControl
            options={MODES}
            value={settings.torchMode}
            onChange={(torchMode) => update({ torchMode })}
          />
          {settings.torchMode === 'blink' ? (
            <>
              <Slider
                value={settings.torchRate}
                min={SPEED_MIN}
                max={SPEED_MAX}
                onChange={(torchRate) => update({ torchRate })}
                formatValue={flashesPerSecond}
                minLabel="Chậm"
                maxLabel="Nhanh"
                accessibilityLabel="Nhịp nháy flash"
              />
              <Text style={styles.rateValue}>{flashesPerSecond(settings.torchRate)}</Text>
            </>
          ) : null}
        </View>
      </ConfirmDialog>
    </>
  );
}

const styles = StyleSheet.create({
  muted: { ...TYPE.caption, fontSize: 15 },
  rateBody: { gap: 12, marginTop: 4 },
  rateValue: { ...TYPE.caption, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
