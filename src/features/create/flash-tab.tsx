import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MenuAction } from '@/components/ui/menu/menu-action';
import { MenuGroup } from '@/components/ui/menu/menu-group';
import { MenuLink } from '@/components/ui/menu/menu-link';
import { MenuToggle } from '@/components/ui/menu/menu-toggle';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import {
  SPEED_MAX,
  SPEED_MIN,
  TORCH_MAX_FLASHES_PER_SECOND,
  torchPeriodMs,
} from '@/configs/effects';
import { ICON_BG, TYPE } from '@/configs/ui';
import type { EditorTabProps } from '@/features/create/types';
import { useTorchPermission } from '@/hooks/use-torch-permission';
import { useStrings } from '@/i18n';
import type { TorchMode } from '@/types/settings';

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
      <MenuGroup label={t.flashTab.group} footer={t.flashTab.blockedFooter}>
        <MenuLink
          title={t.flashTab.cameraPermission}
          icon={{ name: 'camera', color: ICON_BG.gray }}
          value={t.torchStatus.blocked}
          onPress={openSettings}
        />
        <MenuAction title={t.common.openSettings} onPress={openSettings} />
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
    settings.torchMode === 'steady'
      ? t.flashTab.steady
      : t.flashTab.blinkValue(flashesPerSecond(settings.torchRate));

  return (
    <>
      <MenuGroup
        label={t.flashTab.group}
        footer={granted ? flashNote : t.flashTab.askFooter(flashNote)}>
        <MenuToggle
          title={t.flashTab.enable}
          icon={{ name: 'flash', color: ICON_BG.orange }}
          value={enabled}
          onValueChange={(v) => void toggleTorch(v)}
        />
        {enabled ? (
          <MenuToggle
            title={t.flashTab.sync}
            icon={{ name: 'pulse', color: ICON_BG.blue }}
            value={settings.torchSyncWithEffect}
            onValueChange={(torchSyncWithEffect) => update({ torchSyncWithEffect })}
          />
        ) : null}
        {enabled && !settings.torchSyncWithEffect ? (
          <MenuLink
            title={t.flashTab.rate}
            icon={{ name: 'time', color: ICON_BG.gray }}
            value={rateValue}
            onPress={() => setRateOpen(true)}
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
                minLabel={t.common.slow}
                maxLabel={t.common.fast}
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
