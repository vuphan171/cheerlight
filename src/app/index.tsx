import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ColorPicker } from '@/components/ColorPicker';
import { EffectSelector } from '@/components/EffectSelector';
import { Section } from '@/components/Section';
import { SpeedSlider } from '@/components/SpeedSlider';
import { useEffectChooser } from '@/components/StrobeWarning';
import { RADIUS, SPACING, UI } from '@/constants/ui';
import { usePortrait } from '@/hooks/useLandscape';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsScreen() {
  usePortrait();
  const { settings, updateSettings } = useSettings();
  const { choose: chooseEffect, warning } = useEffectChooser((effect) => updateSettings({ effect }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Section title="Màu nền">
        <ColorPicker
          value={settings.backgroundColor}
          onChange={(backgroundColor) => updateSettings({ backgroundColor })}
        />
      </Section>

      <Section title="Hiệu ứng">
        <EffectSelector value={settings.effect} onChange={chooseEffect} />
        {settings.effect !== 'solid' ? (
          <SpeedSlider
            label="Tốc độ"
            value={settings.speed}
            onChange={(speed) => updateSettings({ speed })}
          />
        ) : null}
      </Section>

      <Pressable
        style={styles.startButton}
        accessibilityRole="button"
        onPress={() => router.push('/display')}>
        <Text style={styles.startLabel}>Bắt đầu</Text>
      </Pressable>

      {warning}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: UI.background },
  container: { padding: SPACING, gap: 24, paddingBottom: 48 },
  startButton: {
    backgroundColor: UI.accent,
    borderRadius: RADIUS * 1.5,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startLabel: { color: UI.text, fontSize: 20, fontWeight: '700' },
});
