import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { EditorTabProps } from '@/components/create/types';
import { ColorSwatch, CustomColorSwatch } from '@/components/ui/color-swatch';
import { GroupedSection } from '@/components/ui/grouped-section';
import { HexColorSheet } from '@/components/ui/hex-color-sheet';
import { colorName, PLAY_COLORS } from '@/configs/colors';

const COLUMNS = 8;

export function ColorTab({ settings, update }: EditorTabProps) {
  const [hexOpen, setHexOpen] = useState(false);
  const current = settings.backgroundColor.toUpperCase();
  const isCustom = !PLAY_COLORS.some((c) => c.hex === current);

  return (
    <>
      <GroupedSection
        label={`Màu nền · ${colorName(current)}`}
        list={false}
        footer={
          settings.effect === 'rainbow'
            ? 'Hiệu ứng Cầu vồng đang bật nên màu nền tạm không áp dụng.'
            : undefined
        }>
        <View style={styles.grid} accessibilityRole="radiogroup">
          {PLAY_COLORS.map((c) => (
            <View key={c.hex} style={styles.cell}>
              <ColorSwatch
                color={c.hex}
                selected={c.hex === current}
                onPress={() => update({ backgroundColor: c.hex })}
                accessibilityLabel={`Màu ${c.name}`}
              />
            </View>
          ))}
          <View style={styles.cell}>
            <CustomColorSwatch selected={isCustom} onPress={() => setHexOpen(true)} />
          </View>
        </View>
      </GroupedSection>
      <HexColorSheet
        visible={hexOpen}
        value={current}
        onClose={() => setHexOpen(false)}
        onSubmit={(backgroundColor) => {
          update({ backgroundColor });
          setHexOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  cell: { width: `${100 / COLUMNS}%`, alignItems: 'center' },
});
