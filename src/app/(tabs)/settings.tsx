import Constants from 'expo-constants';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FLASH_NOTE } from '@/components/create/flash-tab';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GroupedSection } from '@/components/ui/grouped-section';
import { LargeTitle } from '@/components/ui/large-title';
import { ListRow } from '@/components/ui/list-row';
import { Toggle } from '@/components/ui/toggle';
import { AUTO_HIDE_OPTIONS } from '@/configs/defaults';
import { GROUP_GAP, ICON_BG, SPACING, TAB_BAR_CLEARANCE, UI } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';
import { TORCH_STATUS_LABEL, useTorchPermission } from '@/hooks/use-torch-permission';
import type { AutoHideMs } from '@/types/settings';

const secondsLabel = (ms: number) => `${ms / 1000} giây`;

export default function SettingsScreen() {
  const { prefs, updatePrefs, strobeAccepted, resetStrobeWarning } = useSettings();
  const torch = useTorchPermission();
  const [autoHideOpen, setAutoHideOpen] = useState(false);

  const pickAutoHide = () => {
    if (Platform.OS !== 'ios') {
      setAutoHideOpen(true);
      return;
    }
    const labels = AUTO_HIDE_OPTIONS.map(secondsLabel);
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'Tự ẩn điều khiển sau', options: [...labels, 'Huỷ'], cancelButtonIndex: labels.length },
      (index) => {
        const ms = AUTO_HIDE_OPTIONS[index];
        if (ms) updatePrefs({ autoHideMs: ms });
      },
    );
  };

  const onCameraRow = () => {
    if (torch.status === 'undetermined') void torch.ensure();
    else if (torch.status === 'blocked' || torch.status === 'granted') torch.openSettings();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <LargeTitle>Cài đặt</LargeTitle>
        <GroupedSection label="Màn Phát">
          <ListRow
            title="Gợi ý “chạm để mở”"
            icon={{ name: 'hand-left', color: ICON_BG.blue }}
            accessory={
              <Toggle
                value={prefs.showTapHint}
                onValueChange={(showTapHint) => updatePrefs({ showTapHint })}
                accessibilityLabel="Gợi ý chạm để mở điều khiển"
              />
            }
          />
          <ListRow
            title="Độ sáng tối đa"
            icon={{ name: 'sunny', color: ICON_BG.yellow }}
            accessory={
              <Toggle
                value={prefs.maxBrightness}
                onValueChange={(maxBrightness) => updatePrefs({ maxBrightness })}
                accessibilityLabel="Độ sáng tối đa khi phát"
              />
            }
          />
          <ListRow
            title="Tự ẩn điều khiển"
            icon={{ name: 'time', color: ICON_BG.gray }}
            value={secondsLabel(prefs.autoHideMs)}
            chevron
            onPress={pickAutoHide}
            last
          />
        </GroupedSection>

        <GroupedSection
          label="Đèn flash"
          footer={`Chỉ dùng camera để bật đèn flash, không chụp hay ghi hình. ${FLASH_NOTE}`}>
          <ListRow
            title="Quyền Camera"
            icon={{ name: 'camera', color: ICON_BG.orange }}
            value={TORCH_STATUS_LABEL[torch.status]}
            chevron={torch.status !== 'unavailable'}
            onPress={torch.status === 'unavailable' ? undefined : onCameraRow}
            last
          />
        </GroupedSection>

        <GroupedSection label="An toàn">
          <ListRow
            title="Hiện lại cảnh báo Strobe"
            titleColor={UI.accent}
            disabled={!strobeAccepted}
            onPress={() => {
              resetStrobeWarning();
              Alert.alert('Đã bật lại', 'Lần tới chọn hoặc phát Strobe sẽ hiện cảnh báo.');
            }}
            last
          />
        </GroupedSection>

        <GroupedSection>
          <ListRow title="Phiên bản" value={Constants.expoConfig?.version ?? '—'} />
          <ListRow title="Font LED" value="Tiny5 · OFL" last />
        </GroupedSection>
      </ScrollView>

      <ConfirmDialog
        visible={autoHideOpen}
        title="Tự ẩn điều khiển sau"
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
          { label: 'Huỷ', onPress: () => setAutoHideOpen(false) },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UI.bg },
  content: { paddingHorizontal: SPACING, paddingBottom: TAB_BAR_CLEARANCE, gap: GROUP_GAP },
});
