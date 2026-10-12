import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ColorSwatch } from '@/components/ui/color-swatch';
import { CustomColorSwatch } from '@/components/ui/custom-color-swatch';
import { HexColorSheet } from '@/components/ui/hex-color-sheet';
import { MenuGroup } from '@/components/ui/menu/menu-group';
import { colorName, PLAY_COLORS } from '@/configs/colors';
import type { EditorTabProps } from '@/features/create/types';
import { useStrings } from '@/i18n';

const COLUMNS = 8;

export function ColorTab({ settings, update }: EditorTabProps) {
  const t = useStrings();

  const [hexOpen, setHexOpen] = useState(false);

  const current = settings.backgroundColor.toUpperCase();
  const isCustom = !PLAY_COLORS.some((c) => c.hex === current);

  return (
    <>
      <MenuGroup
        label={t.colorTab.background(colorName(current, t))}
        list={false}
        footer={settings.effect === 'rainbow' ? t.colorTab.rainbowNote : undefined}>
        <View style={styles.grid}>
          {PLAY_COLORS.map((c) => (
            <View key={c.hex} style={styles.cell}>
              <ColorSwatch
                color={c.hex}
                selected={c.hex === current}
                onPress={() => update({ backgroundColor: c.hex })}
              />
            </View>
          ))}
          <View style={styles.cell}>
            <CustomColorSwatch selected={isCustom} onPress={() => setHexOpen(true)} />
          </View>
        </View>
      </MenuGroup>
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
