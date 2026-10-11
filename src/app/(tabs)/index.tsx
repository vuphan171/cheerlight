import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NameDialog } from '@/components/name-dialog';
import { PresetTile } from '@/features/presets/preset-tile';
import { RecentPresetCard } from '@/features/presets/recent-preset-card';
import { ContextMenu, type MenuAnchor } from '@/components/ui/context-menu';
import { Icon } from '@/components/ui/icon';
import { LargeTitle } from '@/components/ui/large-title';
import { findPresetByName, PRESET_MAX } from '@/configs/presets';
import { SPACING, TAB_BAR_CLEARANCE, TYPE, UI } from '@/configs/ui';
import { usePlay } from '@/hooks/use-play';
import { useSettings } from '@/hooks/use-settings';
import type { Preset } from '@/types/settings';
import { type Strings, useStrings } from '@/i18n';

const GRID_GAP = 12;

function confirmDelete(preset: Preset, t: Strings, onConfirm: () => void) {
  Alert.alert(t.presets.deletePreset, t.presets.deleteConfirm(preset.name), [
    { text: t.common.cancel, style: 'cancel' },
    { text: t.common.delete, style: 'destructive', onPress: onConfirm },
  ]);
}

export default function PresetsScreen() {
  const t = useStrings();
  const { presets, lastUsedPresetId, renamePreset, duplicatePreset, deletePreset } = useSettings();
  const { play, warning } = usePlay();
  const window = useWindowDimensions();
  const [menu, setMenu] = useState<{ preset: Preset; anchor: MenuAnchor } | null>(null);
  const [renaming, setRenaming] = useState<Preset | null>(null);

  const full = presets.length >= PRESET_MAX;
  const recent = presets.find((p) => p.id === lastUsedPresetId);
  const tileWidth = Math.floor((window.width - SPACING * 2 - GRID_GAP) / 2);

  const playPreset = (preset: Preset) => play(preset.settings, preset.id);
  const newPreset = () => router.navigate({ pathname: '/create', params: { presetId: undefined } });

  const menuItems = menu
    ? [
        {
          label: t.presets.edit,
          icon: 'color-palette-outline' as const,
          onPress: () => router.navigate({ pathname: '/create', params: { presetId: menu.preset.id } }),
        },
        { label: t.presets.rename, icon: 'pencil' as const, onPress: () => setRenaming(menu.preset) },
        {
          label: t.presets.duplicate,
          icon: 'copy-outline' as const,
          disabled: full,
          onPress: () => {
            if (!duplicatePreset(menu.preset.id)) {
              Alert.alert(t.presets.fullTitle, t.presets.fullBody(PRESET_MAX));
            }
          },
        },
        {
          label: t.presets.deletePreset,
          icon: 'trash-outline' as const,
          destructive: true,
          separatorBefore: true,
          onPress: () => {
            const target = menu.preset;
            confirmDelete(target, t, () => deletePreset(target.id));
          },
        },
      ]
    : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <LargeTitle>{t.presets.title}</LargeTitle>

        {presets.length === 0 ? (
          <EmptyState t={t} onCreate={newPreset} />
        ) : (
          <View style={styles.body}>
            {recent ? <RecentPresetCard preset={recent} onPlay={() => playPreset(recent)} /> : null}

            <View style={styles.headerRow}>
              <View style={styles.headerTitle}>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  {t.presets.all}
                </Text>
                <Text style={styles.count} accessibilityLabel={t.presets.countA11y(presets.length, PRESET_MAX)}>
                  {presets.length}/{PRESET_MAX}
                </Text>
              </View>
              <Pressable
                onPress={newPreset}
                disabled={full}
                accessibilityRole="button"
                accessibilityLabel={t.presets.new}
                accessibilityHint={full ? t.presets.fullHint(PRESET_MAX) : undefined}
                accessibilityState={{ disabled: full }}
                style={({ pressed }) => [styles.newButton, pressed && styles.newButtonPressed, full && styles.disabled]}>
                <Icon name="add" size={18} color={UI.onAccent} />
                <Text style={styles.newLabel}>{t.presets.new}</Text>
              </Pressable>
            </View>

            <View style={styles.grid}>
              {presets.map((preset) => (
                <PresetTile
                  key={preset.id}
                  preset={preset}
                  width={tileWidth}
                  onPlay={() => playPreset(preset)}
                  onOpenMenu={(anchor) => setMenu({ preset, anchor })}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ContextMenu anchor={menu?.anchor ?? null} items={menuItems} onClose={() => setMenu(null)} />

      <NameDialog
        visible={renaming !== null}
        title={t.presets.renameTitle}
        initialName={renaming?.name ?? ''}
        confirmLabel={() => t.common.save}
        validate={(name) => {
          const clash = findPresetByName(presets, name);
          return clash && clash.id !== renaming?.id ? { error: t.presets.nameTaken(clash.name) } : {};
        }}
        onCancel={() => setRenaming(null)}
        onSubmit={(name) => {
          if (renaming && renamePreset(renaming.id, name) === 'ok') setRenaming(null);
        }}
      />
      {warning}
    </SafeAreaView>
  );
}

function EmptyState({ t, onCreate }: { t: Strings; onCreate: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyArt}>
        <Icon name="albums-outline" size={44} color={UI.accent} />
      </View>
      <Text style={styles.emptyTitle}>{t.presets.emptyTitle}</Text>
      <Text style={styles.emptyBody}>{t.presets.emptyBody}</Text>
      <Pressable
        onPress={onCreate}
        accessibilityRole="button"
        style={({ pressed }) => [styles.newButton, styles.emptyButton, pressed && styles.newButtonPressed]}>
        <Icon name="add" size={18} color={UI.onAccent} />
        <Text style={styles.newLabel}>{t.presets.createFirst}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UI.bg },
  content: { paddingHorizontal: SPACING, paddingBottom: TAB_BAR_CLEARANCE },
  body: { gap: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexShrink: 1 },
  sectionTitle: TYPE.sectionTitle,
  count: { fontSize: 15, color: UI.secondary, fontVariant: ['tabular-nums'] },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: UI.accent,
  },
  newButtonPressed: { backgroundColor: UI.accentPressed },
  newLabel: { fontSize: 15, fontWeight: '600', color: UI.onAccent },
  disabled: { opacity: 0.4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, flexShrink: 0 },
  empty: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 72, gap: 10 },
  emptyArt: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: UI.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { ...TYPE.sectionTitle, textAlign: 'center' },
  emptyBody: { ...TYPE.caption, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  emptyButton: { marginTop: 12, minHeight: 44, paddingHorizontal: 18, borderRadius: 22 },
});
