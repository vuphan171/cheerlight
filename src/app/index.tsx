import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ColorPicker } from '@/components/color-picker';
import { EffectPreview } from '@/components/effect-preview';
import { EffectSelector } from '@/components/effect-selector';
import { PresetManager } from '@/components/preset-manager';
import { Section } from '@/components/section';
import { Segmented } from '@/components/segmented';
import { SpeedSlider } from '@/components/speed-slider';
import { useEffectChooser } from '@/components/strobe-warning';
import { TorchSettings } from '@/components/torch-settings';
import { FONT_SIZE_MAX, FONT_SIZE_MIN } from '@/configs/effects';
import { LED_FONT_FAMILY, TEXT_MAX_LENGTH } from '@/configs/fonts';
import { RADIUS, SPACING, UI } from '@/configs/ui';
import { usePortrait } from '@/hooks/use-landscape';
import { useSettings } from '@/hooks/use-settings';
import type { ScrollDirection, TextFont } from '@/types/settings';

const FONT_SIZE_STEP = 20;

const DIRECTIONS: readonly { value: ScrollDirection; label: string }[] = [
  { value: 'left', label: '← Sang trái' },
  { value: 'right', label: 'Sang phải →' },
];

const FONTS: readonly { value: TextFont; label: string }[] = [
  { value: 'led', label: 'LED' },
  { value: 'system', label: 'Thường' },
];

export default function SettingsScreen() {
  usePortrait();
  const { settings, updateSettings } = useSettings();
  const { choose: chooseEffect, warning } = useEffectChooser((effect) => updateSettings({ effect }));
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <View style={styles.screen}>
      {previewVisible ? (
        <View style={styles.previewDock}>
          <EffectPreview settings={settings} />
        </View>
      ) : null}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Section title="Mẫu đã lưu">
          <PresetManager />
        </Section>

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

        <Section title="Chữ chạy">
          <TextInput
            value={settings.text}
            onChangeText={(text) => updateSettings({ text })}
            placeholder="Nhập nội dung cổ vũ… (để trống = không hiện chữ)"
            placeholderTextColor={UI.textMuted}
            maxLength={TEXT_MAX_LENGTH}
            multiline
            style={styles.textInput}
            accessibilityLabel="Nội dung chữ chạy"
          />
          {settings.text ? (
            <>
              <View style={styles.fontPreviewBox}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.fontPreview,
                    {
                      color: settings.textColor,
                      fontFamily: settings.textFont === 'led' ? LED_FONT_FAMILY : undefined,
                    },
                  ]}>
                  {settings.text}
                </Text>
              </View>
              <Text style={styles.fieldLabel}>Kiểu chữ</Text>
              <Segmented
                options={FONTS}
                value={settings.textFont}
                onChange={(textFont) => updateSettings({ textFont })}
              />
              <Text style={styles.fieldLabel}>Màu chữ</Text>
              <ColorPicker
                value={settings.textColor}
                onChange={(textColor) => updateSettings({ textColor })}
              />
              <SpeedSlider
                label="Cỡ chữ"
                min={FONT_SIZE_MIN / FONT_SIZE_STEP}
                max={FONT_SIZE_MAX / FONT_SIZE_STEP}
                value={Math.round(settings.fontSize / FONT_SIZE_STEP)}
                onChange={(v) => updateSettings({ fontSize: v * FONT_SIZE_STEP })}
                formatValue={(v) => `${v * FONT_SIZE_STEP}`}
              />
              <SpeedSlider
                label="Tốc độ chạy"
                value={settings.scrollSpeed}
                onChange={(scrollSpeed) => updateSettings({ scrollSpeed })}
              />
              <Text style={styles.fieldLabel}>Hướng chạy</Text>
              <Segmented
                options={DIRECTIONS}
                value={settings.scrollDirection}
                onChange={(scrollDirection) => updateSettings({ scrollDirection })}
              />
            </>
          ) : null}
        </Section>

        <Section title="Đèn flash">
          <TorchSettings />
        </Section>

        <View style={styles.actions}>
          <Pressable
            style={[styles.previewButton, previewVisible && styles.previewButtonOn]}
            accessibilityRole="switch"
            accessibilityState={{ checked: previewVisible }}
            onPress={() => setPreviewVisible((v) => !v)}>
            <Text style={styles.previewLabel}>{previewVisible ? 'Ẩn xem trước' : 'Xem trước'}</Text>
          </Pressable>
          <Pressable
            style={styles.startButton}
            accessibilityRole="button"
            onPress={() => router.push('/display')}>
            <Text style={styles.startLabel}>Bắt đầu</Text>
          </Pressable>
        </View>

        {warning}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UI.background },
  container: { padding: SPACING, gap: 24, paddingBottom: 48 },
  actions: { flexDirection: 'row', gap: 12 },
  previewDock: {
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    backgroundColor: UI.background,
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
  },
  previewButton: {
    paddingHorizontal: 18,
    borderRadius: RADIUS * 1.5,
    backgroundColor: UI.surfaceRaised,
    borderWidth: 1,
    borderColor: UI.border,
    justifyContent: 'center',
  },
  previewButtonOn: { borderColor: UI.accent },
  previewLabel: { color: UI.text, fontSize: 15, fontWeight: '600' },
  startButton: {
    flex: 1,
    backgroundColor: UI.accent,
    borderRadius: RADIUS * 1.5,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startLabel: { color: UI.text, fontSize: 20, fontWeight: '700' },
  textInput: {
    color: UI.text,
    backgroundColor: UI.surfaceRaised,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 48,
  },
  fieldLabel: { color: UI.textMuted, fontSize: 14, marginBottom: -6 },
  fontPreviewBox: {
    backgroundColor: '#000',
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  fontPreview: { fontSize: 28 },
});
