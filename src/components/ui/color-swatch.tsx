import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { autoTextColor, colorName } from '@/configs/colors';
import { UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
}

/** Ô màu tròn. Khi chọn: vòng trắng 2.5 + vòng accent 2, kèm ✓ đen/trắng theo độ chói. */
export function ColorSwatch({ color, selected, onPress, size = 34, accessibilityLabel }: ColorSwatchProps) {
  const t = useStrings();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? t.color.a11y(colorName(color, t))}
      onPress={onPress}
      hitSlop={4}
      style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }, selected && styles.ring]}>
      <View
        style={[
          styles.inner,
          { backgroundColor: color, borderRadius: size / 2 },
          selected && { margin: 2.5, borderRadius: (size - 9) / 2 },
        ]}>
        {selected ? <Icon name="checkmark" size={size * 0.5} color={autoTextColor(color)} /> : null}
      </View>
    </Pressable>
  );
}

/** Ô "＋ màu khác": vòng nhiều màu (PNG tĩnh), giữa là chấm trắng có dấu ＋. */
export function CustomColorSwatch({
  selected,
  onPress,
  size = 34,
}: {
  selected: boolean;
  onPress: () => void;
  size?: number;
}) {
  const t = useStrings();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={t.color.customA11y}
      onPress={onPress}
      hitSlop={4}
      style={[styles.custom, { width: size, height: size }]}>
      <Image
        source={require('../../../assets/images/color-ring.png')}
        style={[styles.ring360, { width: size, height: size }]}
      />
      <View
        style={[
          styles.customDot,
          { width: size - 12, height: size - 12, borderRadius: (size - 12) / 2 },
          selected && styles.customDotSelected,
        ]}>
        <Icon name={selected ? 'checkmark' : 'add'} size={size * 0.45} color={selected ? UI.onAccent : UI.label} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderWidth: 2, borderColor: 'transparent' },
  ring: { borderColor: UI.accent },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.separator,
  },
  custom: { alignItems: 'center', justifyContent: 'center' },
  ring360: { position: 'absolute', top: 0, left: 0 },
  customDot: { backgroundColor: UI.surface, alignItems: 'center', justifyContent: 'center' },
  customDotSelected: { backgroundColor: UI.accent },
});
