import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SPACING, TYPE, UI } from '@/configs/ui';

interface NavButton {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  bold?: boolean;
}

export function NavBar({
  title,
  left,
  right,
}: {
  title: string;
  left?: NavButton;
  right?: NavButton;
}) {
  return (
    <View style={styles.bar}>
      <View style={[styles.side, styles.left]}>{left ? <NavTextButton {...left} /> : null}</View>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right ? <NavTextButton {...right} /> : null}</View>
    </View>
  );
}

function NavTextButton({ label, onPress, disabled, bold }: NavButton) {
  return (
    <Pressable disabled={disabled} onPress={onPress} hitSlop={10} style={styles.button}>
      {({ pressed }) => (
        <Text
          style={[
            styles.buttonLabel,
            bold && styles.bold,
            pressed && { color: UI.accentPressed },
            disabled && styles.disabled,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: SPACING },
  side: { flex: 1 },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  title: { ...TYPE.navTitle, flex: 2, textAlign: 'center' },
  button: { minHeight: 44, justifyContent: 'center' },
  buttonLabel: { fontSize: 17, color: UI.accent },
  bold: { fontWeight: '600' },
  disabled: { opacity: 0.35 },
});
