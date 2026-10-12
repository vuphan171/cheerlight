import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useEffectChooser } from '@/components/strobe-warning';
import { NavBar } from '@/components/ui/nav-bar';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { GROUP_GAP, SPACING, TAB_BAR_CLEARANCE } from '@/configs/ui';
import { DeletePresetButton } from '@/features/create/delete-preset-button';
import { PreviewPanel } from '@/features/create/preview-panel';
import { SavePresetDialog } from '@/features/create/save-preset-dialog';
import { SubTabContent } from '@/features/create/sub-tab-content';
import { usePresetEditor } from '@/features/create/use-preset-editor';
import { SUB_TABS, useSubTab } from '@/features/create/use-sub-tab';
import { usePlay } from '@/hooks/use-play';
import { useStrings } from '@/i18n';

const CreateScreen = () => {
  const t = useStrings();
  const { presetId } = useLocalSearchParams<{ presetId?: string }>();
  const editor = usePresetEditor(presetId);
  const { editing, settings, update } = editor;
  const { play, warning: playWarning } = usePlay();
  const { choose: chooseEffect, warning: strobeWarning } = useEffectChooser((effect) =>
    update({ effect }),
  );
  const [subTab, selectSubTab] = useSubTab();
  const [naming, setNaming] = useState(false);

  const save = () => (editing ? editor.saveEditing() : setNaming(true));

  const submitName = (name: string) => {
    if (editor.saveDraftAs(name)) setNaming(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <NavBar
        title={editing ? t.create.editTitle(editing.name) : t.create.title}
        left={{ label: t.create.reset, onPress: editor.reset }}
        right={{ label: t.common.save, onPress: save, bold: true }}
      />

      <View style={styles.header}>
        <PreviewPanel settings={settings} onPlay={() => play(settings, editing?.id)} />
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
        <SubTabContent
          tab={subTab}
          settings={settings}
          update={update}
          chooseEffect={chooseEffect}
        />
        {editing ? <DeletePresetButton onPress={editor.confirmDelete} /> : null}
      </ScrollView>

      <SavePresetDialog
        visible={naming}
        presets={editor.presets}
        onCancel={() => setNaming(false)}
        onSubmit={submitName}
      />
      {strobeWarning}
      {playWarning}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingHorizontal: SPACING,
    paddingBottom: theme.space(3),
    gap: theme.space(3),
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING,
    paddingTop: theme.space(2),
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: GROUP_GAP,
  },
}));

export default CreateScreen;
