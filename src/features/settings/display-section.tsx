import { useState } from 'react';
import { ActionSheetIOS, Platform } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MenuGroup } from '@/components/ui/menu-group';
import { MenuItem } from '@/components/ui/menu-item';
import { Toggle } from '@/components/ui/toggle';
import { AUTO_HIDE_OPTIONS } from '@/configs/defaults';
import { ICON_BG } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';
import type { AutoHideMs } from '@/types/settings';
import { useStrings } from '@/i18n';

/** Nhóm "Màn Phát": gợi ý chạm, độ sáng tối đa, thời gian tự ẩn điều khiển. */
const DisplaySection = () => {
  const t = useStrings();
  const { prefs, updatePrefs } = useSettings();
  const secondsLabel = (ms: number) => t.settings.seconds(ms / 1000);
  const [autoHideOpen, setAutoHideOpen] = useState(false);

  const pickAutoHide = () => {
    if (Platform.OS !== 'ios') {
      setAutoHideOpen(true);
      return;
    }
    const labels = AUTO_HIDE_OPTIONS.map(secondsLabel);
    ActionSheetIOS.showActionSheetWithOptions(
      { title: t.settings.autoHideTitle, options: [...labels, t.common.cancel], cancelButtonIndex: labels.length },
      (index) => {
        const ms = AUTO_HIDE_OPTIONS[index];
        if (ms) updatePrefs({ autoHideMs: ms });
      },
    );
  };

  return (
    <>
      <MenuGroup label={t.settings.display}>
        <MenuItem
          title={t.settings.tapHint}
          icon={{ name: 'hand-left', color: ICON_BG.blue }}
          accessory={
            <Toggle
              value={prefs.showTapHint}
              onValueChange={(showTapHint) => updatePrefs({ showTapHint })}
              accessibilityLabel={t.settings.tapHintA11y}
            />
          }
        />
        <MenuItem
          title={t.settings.maxBrightness}
          icon={{ name: 'sunny', color: ICON_BG.yellow }}
          accessory={
            <Toggle
              value={prefs.maxBrightness}
              onValueChange={(maxBrightness) => updatePrefs({ maxBrightness })}
              accessibilityLabel={t.settings.maxBrightnessA11y}
            />
          }
        />
        <MenuItem
          title={t.settings.autoHide}
          icon={{ name: 'time', color: ICON_BG.gray }}
          value={secondsLabel(prefs.autoHideMs)}
          chevron
          onPress={pickAutoHide}
          last
        />
      </MenuGroup>

      <ConfirmDialog
        visible={autoHideOpen}
        title={t.settings.autoHideTitle}
        onRequestClose={() => setAutoHideOpen(false)}
        actions={[
          ...AUTO_HIDE_OPTIONS.map((ms) => ({
            label: `${secondsLabel(ms)}${ms === prefs.autoHideMs ? '  ✓' : ''}`,
            kind: ms === prefs.autoHideMs ? ('primary' as const) : ('default' as const),
            onPress: () => {
              updatePrefs({ autoHideMs: ms as AutoHideMs });
              setAutoHideOpen(false);
            },
          })),
          { label: t.common.cancel, onPress: () => setAutoHideOpen(false) },
        ]}
      />
    </>
  );
};

export { DisplaySection };
