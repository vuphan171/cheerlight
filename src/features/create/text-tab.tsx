import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { EditorTabProps } from '@/features/create/types';
import { ColorSwatch, CustomColorSwatch } from '@/components/ui/color-swatch';
import { MenuGroup } from '@/components/ui/menu-group';
import { HexColorSheet } from '@/components/ui/hex-color-sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { colorName, TEXT_COLOR_QUICK } from '@/configs/colors';
import { FONT_SIZE_MAX, FONT_SIZE_MIN, FONT_SIZE_STEP, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { TEXT_MAX_LENGTH } from '@/configs/fonts';
import { TYPE, UI } from '@/configs/ui';
import type { ScrollDirection, TextFont } from '@/types/settings';
import { useStrings } from '@/i18n';

const QUICK_SWATCH = 30;

export function TextTab({ settings, update }: EditorTabProps) {
  const t = useStrings();
  const [hexOpen, setHexOpen] = useState(false);
  const fonts: readonly { value: TextFont; label: string }[] = [
    { value: 'led', label: t.textTab.fontLed },
    { value: 'system', label: t.textTab.fontSystem },
  ];
  const directions: readonly { value: ScrollDirection; label: string; accessibilityLabel: string }[] = [
    { value: 'left', label: '←', accessibilityLabel: t.textTab.left },
    { value: 'right', label: '→', accessibilityLabel: t.textTab.right },
  ];
  const fixed = settings.textColorMode === 'fixed';
  const textColor = settings.textColor.toUpperCase();
  const customSelected = fixed && !TEXT_COLOR_QUICK.some((c) => c === textColor);

  return (
    <>
      <MenuGroup label={t.textTab.text} list={false} footer={t.textTab.textFooter}>
        <View style={styles.inputRow}>
          <TextInput
            value={settings.text}
            onChangeText={(text) => update({ text })}
            placeholder={t.textTab.placeholder}
            placeholderTextColor={UI.secondary}
            maxLength={TEXT_MAX_LENGTH}
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel={t.textTab.textA11y}
          />
          <Text style={styles.counter} accessibilityLabel={t.textTab.counterA11y(settings.text.length, TEXT_MAX_LENGTH)}>
            {settings.text.length}/{TEXT_MAX_LENGTH}
          </Text>
        </View>
      </MenuGroup>

      <MenuGroup label={t.textTab.font} list={false}>
        <SegmentedControl options={fonts} value={settings.textFont} onChange={(textFont) => update({ textFont })} />
      </MenuGroup>

      <MenuGroup label={t.textTab.textColor(fixed ? colorName(textColor, t) : t.textTab.auto)} list={false}>
        <View style={styles.colorRow} accessibilityRole="radiogroup">
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: !fixed }}
            accessibilityLabel={t.textTab.autoA11y}
            onPress={() => update({ textColorMode: 'auto' })}
            style={[styles.autoPill, !fixed && styles.autoPillOn]}>
            <Text style={[styles.autoLabel, !fixed && styles.autoLabelOn]}>{t.textTab.auto}</Text>
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
      </MenuGroup>

      <MenuGroup label={t.textTab.direction} list={false}>
        <SegmentedControl
          options={directions}
          value={settings.scrollDirection}
          onChange={(scrollDirection) => update({ scrollDirection })}
        />
      </MenuGroup>

      <MenuGroup label={t.textTab.size} list={false}>
        <Slider
          value={Math.round(settings.fontSize / FONT_SIZE_STEP)}
          min={FONT_SIZE_MIN / FONT_SIZE_STEP}
          max={FONT_SIZE_MAX / FONT_SIZE_STEP}
          onChange={(v) => update({ fontSize: v * FONT_SIZE_STEP })}
          formatValue={(v) => `${v * FONT_SIZE_STEP}`}
          accessibilityLabel={t.textTab.size}
          minLabel={<Text style={styles.aSmall}>A</Text>}
          maxLabel={<Text style={styles.aBig}>A</Text>}
        />
      </MenuGroup>

      <MenuGroup label={t.textTab.scrollSpeed} list={false}>
        <Slider
          value={settings.scrollSpeed}
          min={SPEED_MIN}
          max={SPEED_MAX}
          onChange={(scrollSpeed) => update({ scrollSpeed })}
          minLabel={t.common.slow}
          maxLabel={t.common.fast}
          accessibilityLabel={t.textTab.scrollSpeedA11y}
        />
      </MenuGroup>

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
