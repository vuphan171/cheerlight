import type React from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card } from '@/components/ui/card';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { CustomColorSwatch } from '@/components/ui/custom-color-swatch';
import { Grid } from '@/components/ui/grid';
import { HexColorSheet } from '@/components/ui/hex-color-sheet';
import { colorName, PLAY_COLORS } from '@/configs/colors';
import type { EditorTabProps } from '@/features/create/types';
import { useStrings } from '@/i18n';

const ColorTab: React.FC<EditorTabProps> = ({ settings, update }) => {
  const t = useStrings();

  const [hexOpen, setHexOpen] = useState(false);

  const current = settings.backgroundColor.toUpperCase();
  const isCustom = !PLAY_COLORS.some((c) => c.hex === current);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>{t.colorTab.background(colorName(current, t))}</Text>
        <Card>
          <Grid columns={8} gapX={1} gapY={2}>
            {PLAY_COLORS.map((c) => (
              <ColorSwatch
                key={c.hex}
                color={c.hex}
                selected={c.hex === current}
                onPress={() => update({ backgroundColor: c.hex })}
              />
            ))}
            <CustomColorSwatch selected={isCustom} onPress={() => setHexOpen(true)} />
          </Grid>
        </Card>
        {settings.effect === 'rainbow' ? (
          <Text style={styles.footer}>{t.colorTab.rainbowNote}</Text>
        ) : null}
      </View>
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
};

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.space(2),
    flexShrink: 0,
  },
  label: {
    ...theme.type.groupLabel,
    paddingHorizontal: theme.space(4),
  },
  footer: {
    ...theme.type.caption,
    paddingHorizontal: theme.space(4),
  },
}));

export { ColorTab };
