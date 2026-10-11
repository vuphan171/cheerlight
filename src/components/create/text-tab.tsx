import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { EditorTabProps } from '@/components/create/types';
import { ColorSwatch, CustomColorSwatch } from '@/components/ui/color-swatch';
import { GroupedSection } from '@/components/ui/grouped-section';
import { HexColorSheet } from '@/components/ui/hex-color-sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { colorName, TEXT_COLOR_QUICK } from '@/configs/colors';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, FONT_SIZE_STEP, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { TEXT_MAX_LENGTH } from '@/configs/fonts';
import { TYPE, UI } from '@/configs/ui';
import type { ScrollDirection, TextFont } from '@/types/settings';

const FONTS: readonly { value: TextFont; label: string }[] = [
  { value: 'led', label: 'LED' },
  { value: 'system', label: 'Thường' },
];

const DIRECTIONS: readonly { value: ScrollDirection; label: string; accessibilityLabel: string }[] = [
  { value: 'left', label: '←', accessibilityLabel: 'Chạy sang trái' },
  { value: 'right', label: '→', accessibilityLabel: 'Chạy sang phải' },
];

const QUICK_SWATCH = 30;

export function TextTab({ settings, update }: EditorTabProps) {
  const [hexOpen, setHexOpen] = useState(false);
  const fixed = settings.textColorMode === 'fixed';
  const textColor = settings.textColor.toUpperCase();
  const customSelected = fixed && !TEXT_COLOR_QUICK.some((c) => c === textColor);

  return (
    <>
      <GroupedSection label="Chữ chạy" list={false} footer="Để trống thì màn Phát không hiện chữ.">
        <View style={styles.inputRow}>
          <TextInput
            value={settings.text}
            onChangeText={(text) => update({ text })}
            placeholder="Nhập nội dung cổ vũ…"
            placeholderTextColor={UI.secondary}
            maxLength={TEXT_MAX_LENGTH}
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Nội dung chữ chạy"
          />
          <Text style={styles.counter} accessibilityLabel={`${settings.text.length} trên ${TEXT_MAX_LENGTH} ký tự`}>
            {settings.text.length}/{TEXT_MAX_LENGTH}
          </Text>
        </View>
      </GroupedSection>

      <GroupedSection label="Kiểu chữ" list={false}>
        <SegmentedControl options={FONTS} value={settings.textFont} onChange={(textFont) => update({ textFont })} />
      </GroupedSection>

      <GroupedSection label={`Màu chữ · ${fixed ? colorName(textColor) : 'Tự động'}`} list={false}>
        <View style={styles.colorRow} accessibilityRole="radiogroup">
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: !fixed }}
            accessibilityLabel="Màu chữ tự động theo màu nền"
            onPress={() => update({ textColorMode: 'auto' })}
            style={[styles.autoPill, !fixed && styles.autoPillOn]}>
            <Text style={[styles.autoLabel, !fixed && styles.autoLabelOn]}>Tự động</Text>
          </Pressable>
          {TEXT_COLOR_QUICK.map((color) => (
            <ColorSwatch
              key={color}
              size={QUICK_SWATCH}
              color={color}
              selected={fixed && textColor === color}
              onPress={() => update({ textColorMode: 'fixed', textColor: color })}
            />
          ))}
          <CustomColorSwatch size={QUICK_SWATCH} selected={customSelected} onPress={() => setHexOpen(true)} />
        </View>
      </GroupedSection>

      <GroupedSection label="Hướng chạy" list={false}>
        <SegmentedControl
          options={DIRECTIONS}
          value={settings.scrollDirection}
          onChange={(scrollDirection) => update({ scrollDirection })}
        />
      </GroupedSection>

      <GroupedSection label="Cỡ chữ" list={false}>
        <Slider
          value={Math.round(settings.fontSize / FONT_SIZE_STEP)}
          min={FONT_SIZE_MIN / FONT_SIZE_STEP}
          max={FONT_SIZE_MAX / FONT_SIZE_STEP}
          onChange={(v) => update({ fontSize: v * FONT_SIZE_STEP })}
          formatValue={(v) => `${v * FONT_SIZE_STEP}`}
          accessibilityLabel="Cỡ chữ"
          minLabel={<Text style={styles.aSmall}>A</Text>}
          maxLabel={<Text style={styles.aBig}>A</Text>}
        />
      </GroupedSection>

      <GroupedSection label="Tốc độ chạy" list={false}>
        <Slider
          value={settings.scrollSpeed}
          min={SPEED_MIN}
          max={SPEED_MAX}
          onChange={(scrollSpeed) => update({ scrollSpeed })}
          minLabel="Chậm"
          maxLabel="Nhanh"
          accessibilityLabel="Tốc độ chạy chữ"
        />
      </GroupedSection>

      <HexColorSheet
        visible={hexOpen}
        value={textColor}
        onClose={() => setHexOpen(false)}
        onSubmit={(hex) => {
          update({ textColorMode: 'fixed', textColor: hex });
          setHexOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { ...TYPE.body, flex: 1, minHeight: 28, paddingVertical: 0 },
  counter: { ...TYPE.caption, fontVariant: ['tabular-nums'] },
  colorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  autoPill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: UI.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoPillOn: { backgroundColor: UI.accent },
  autoLabel: { fontSize: 14, fontWeight: '600', color: UI.label },
  autoLabelOn: { color: UI.onAccent },
  aSmall: { fontSize: 13, fontWeight: '600', color: UI.secondary },
  aBig: { fontSize: 22, fontWeight: '600', color: UI.secondary },
});
