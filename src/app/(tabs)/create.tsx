import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorTab } from '@/features/create/color-tab';
import { EffectTab } from '@/features/create/effect-tab';
import { FlashTab } from '@/features/create/flash-tab';
import { TextTab } from '@/features/create/text-tab';
import { EFFECT_META } from '@/components/effect-meta';
import { NameDialog } from '@/components/name-dialog';
import { PreviewFrame } from '@/features/create/preview-frame';
import { useEffectChooser } from '@/components/strobe-warning';
import { Icon } from '@/components/ui/icon';
import { NavBar } from '@/components/ui/nav-bar';
import { PlayButton } from '@/components/ui/play-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { DEFAULT_SETTINGS } from '@/configs/defaults';
import { effectLabel, findPresetByName, PRESET_MAX, suggestPresetName } from '@/configs/presets';
import { GROUP_GAP, SPACING, TAB_BAR_CLEARANCE, UI } from '@/configs/ui';
import { usePlay } from '@/hooks/use-play';
import { useSettings } from '@/hooks/use-settings';
import type { LightSettings } from '@/types/settings';
import { useStrings } from '@/i18n';

type SubTab = 'color' | 'effect' | 'text' | 'flash';

const SUB_TABS: readonly SubTab[] = ['color', 'effect', 'text', 'flash'];

// Nhớ tab con đang chọn trong lúc mở app (không lưu xuống đĩa).
let lastSubTab: SubTab = 'color';

export default function CreateScreen() {
  const t = useStrings();
  const { presetId } = useLocalSearchParams<{ presetId?: string }>();
  const { draft, updateDraft, resetDraft, presets, createPreset, updatePresetSettings, deletePreset } =
    useSettings();
  const { play, warning: playWarning } = usePlay();
  const editing = presetId ? presets.find((p) => p.id === presetId) : undefined;

  // Chế độ Sửa chỉnh trên bản sao cục bộ (không đụng bản nháp); đổi mẫu thì nạp lại.
  const [buffer, setBuffer] = useState<LightSettings>(editing?.settings ?? DEFAULT_SETTINGS);
  const [bufferFor, setBufferFor] = useState(editing?.id);
  if (editing && bufferFor !== editing.id) {
    setBufferFor(editing.id);
    setBuffer(editing.settings);
  } else if (!editing && bufferFor !== undefined) {
    // Rời chế độ Sửa mà chưa Lưu → bỏ thay đổi; lần sau mở lại sẽ nạp từ mẫu.
    setBufferFor(undefined);
  }

  // presetId trỏ tới mẫu không còn (vừa xoá) → về chế độ tạo mới.
  useEffect(() => {
    if (presetId && !editing) router.setParams({ presetId: undefined });
  }, [presetId, editing]);

  const settings = editing ? buffer : draft;
  const updateBuffer = useCallback((patch: Partial<LightSettings>) => {
    setBuffer((prev) => ({ ...prev, ...patch }));
  }, []);
  const update = editing ? updateBuffer : updateDraft;

  const { choose: chooseEffect, warning: strobeWarning } = useEffectChooser((effect) => update({ effect }));
  const [subTab, setSubTab] = useState<SubTab>(lastSubTab);
  const [naming, setNaming] = useState(false);

  const selectSubTab = (tab: SubTab) => {
    lastSubTab = tab;
    setSubTab(tab);
  };

  const reset = () => {
    Alert.alert(
      t.create.reset,
      editing ? t.create.resetEditing : t.create.resetDraft,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.create.reset,
          style: 'destructive',
          onPress: () => (editing ? setBuffer(editing.settings) : resetDraft()),
        },
      ],
    );
  };

  const save = () => {
    if (editing) {
      updatePresetSettings(editing.id, buffer);
      router.navigate('/');
    } else {
      setNaming(true);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t.presets.deletePreset, t.presets.deleteConfirm(editing.name), [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          deletePreset(editing.id);
          router.navigate('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <NavBar
        title={editing ? t.create.editTitle(editing.name) : t.create.title}
        left={{ label: t.create.reset, onPress: reset }}
        right={{ label: t.common.save, onPress: save, bold: true }}
      />

      <View style={styles.fixed}>
        <PreviewFrame settings={settings}>
          <View style={styles.effectBadge} pointerEvents="none">
            <Icon name={EFFECT_META[settings.effect].icon} size={13} color="#FFFFFF" />
            <Text style={styles.effectBadgeLabel}>{effectLabel(settings.effect, t)}</Text>
          </View>
          <View style={styles.play}>
            <PlayButton
              onPress={() => play(settings, editing?.id)}
              accessibilityLabel={editing ? t.create.playEditingA11y(editing.name) : t.create.playDraftA11y}
            />
          </View>
        </PreviewFrame>
        <SegmentedControl
          options={SUB_TABS.map((value) => ({ value, label: t.create.subTabs[value] }))}
          value={subTab}
          onChange={selectSubTab}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets>
        {subTab === 'color' ? <ColorTab settings={settings} update={update} /> : null}
        {subTab === 'effect' ? <EffectTab settings={settings} update={update} chooseEffect={chooseEffect} /> : null}
        {subTab === 'text' ? <TextTab settings={settings} update={update} /> : null}
        {subTab === 'flash' ? <FlashTab settings={settings} update={update} /> : null}

        {editing ? (
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}>
            <Icon name="trash-outline" size={20} color={UI.danger} />
            <Text style={styles.deleteLabel}>{t.create.deleteThis}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <NameDialog
        visible={naming}
        title={t.create.saveAs}
        initialName={suggestPresetName(presets, t)}
        confirmLabel={(name) => (findPresetByName(presets, name) ? t.create.overwrite : t.common.save)}
        validate={(name) => {
          const existing = findPresetByName(presets, name);
          if (existing) return { hint: t.create.overwriteHint(existing.name) };
          if (presets.length >= PRESET_MAX) {
            return { error: t.create.fullError(PRESET_MAX) };
          }
          return {};
        }}
        onCancel={() => setNaming(false)}
        onSubmit={(name) => {
          if (createPreset(name, draft) !== null) {
            setNaming(false);
            router.navigate('/');
          }
        }}
      />
      {strobeWarning}
      {playWarning}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UI.bg },
  fixed: { paddingHorizontal: SPACING, paddingBottom: 12, gap: 14 },
  effectBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  effectBadgeLabel: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  play: { position: 'absolute', right: 12, bottom: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING, paddingTop: 8, paddingBottom: TAB_BAR_CLEARANCE, gap: GROUP_GAP },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: UI.surface,
  },
  deletePressed: { backgroundColor: '#E9E9EE' },
  deleteLabel: { fontSize: 17, color: UI.danger },
});
