import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { EditorTabProps } from '@/features/create/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MenuGroup } from '@/components/ui/menu-group';
import { MenuItem } from '@/components/ui/menu-item';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { SPEED_MAX, SPEED_MIN, TORCH_MAX_FLASHES_PER_SECOND, torchPeriodMs } from '@/configs/effects';
import { ICON_BG, TYPE, UI } from '@/configs/ui';
import { useTorchPermission } from '@/hooks/use-torch-permission';
import type { TorchMode } from '@/types/settings';
import { useStrings } from '@/i18n';



export function FlashTab({ settings, update }: EditorTabProps) {
  const t = useStrings();
  const { status, granted, ensure, openSettings } = useTorchPermission();
  const flashNote = t.flash.note(TORCH_MAX_FLASHES_PER_SECOND);
  const flashesPerSecond = (rate: number) => t.flash.flashesPerSecond(1000 / torchPeriodMs(rate));
  const modes: readonly { value: TorchMode; label: string }[] = [
    { value: 'steady', label: t.flashTab.steady },
    { value: 'blink', label: t.flashTab.blink },
  ];
  const [rateOpen, setRateOpen] = useState(false);

  // Mất quyền (vd. thu hồi trong Cài đặt) → tắt flash.
  useEffect(() => {
    if (status !== 'granted' && status !== 'undetermined' && settings.torchEnabled) {
      update({ torchEnabled: false });
    }
  }, [status, settings.torchEnabled, update]);

  if (status === 'unavailable') {
    return (
      <MenuGroup label={t.flashTab.group} list={false}>
        <Text style={styles.muted}>{t.flashTab.unsupported}</Text>
      </MenuGroup>
    );
  }

  if (status === 'blocked') {
    return (
      <MenuGroup
        label={t.flashTab.group}
        footer={t.flashTab.blockedFooter}>
        <MenuItem
          title={t.flashTab.cameraPermission}
          icon={{ name: 'camera', color: ICON_BG.gray }}
          value={t.torchStatus.blocked}
          chevron
          onPress={openSettings}
        />
        <MenuItem title={t.common.openSettings} titleColor={UI.accent} onPress={openSettings} last />
      </MenuGroup>
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
    settings.torchMode === 'steady' ? t.flashTab.steady : t.flashTab.blinkValue(flashesPerSecond(settings.torchRate));

  return (
    <>
      <MenuGroup
        label={t.flashTab.group}
        footer={granted ? flashNote : t.flashTab.askFooter(flashNote)}>
        <MenuItem
          title={t.flashTab.enable}
          icon={{ name: 'flash', color: ICON_BG.orange }}
          accessory={
            <Toggle value={enabled} onValueChange={(v) => void toggleTorch(v)} accessibilityLabel={t.flashTab.enable} />
          }
          last={!enabled}
        />
        {enabled ? (
          <MenuItem
            title={t.flashTab.sync}
            icon={{ name: 'pulse', color: ICON_BG.blue }}
            accessory={
              <Toggle
                value={settings.torchSyncWithEffect}
                onValueChange={(torchSyncWithEffect) => update({ torchSyncWithEffect })}
                accessibilityLabel={t.flashTab.syncA11y}
              />
            }
            last={settings.torchSyncWithEffect}
          />
        ) : null}
        {enabled && !settings.torchSyncWithEffect ? (
          <MenuItem
            title={t.flashTab.rate}
            icon={{ name: 'time', color: ICON_BG.gray }}
            value={rateValue}
            chevron
            onPress={() => setRateOpen(true)}
            last
          />
        ) : null}
      </MenuGroup>

      <ConfirmDialog
        visible={rateOpen}
        title={t.flashTab.rateTitle}
        onRequestClose={() => setRateOpen(false)}
        actions={[{ label: t.common.done, kind: 'primary', onPress: () => setRateOpen(false) }]}>
        <View style={styles.rateBody}>
          <SegmentedControl
            options={modes}
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
                minLabel={t.common.slow}
                maxLabel={t.common.fast}
                accessibilityLabel={t.flashTab.rateA11y}
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
