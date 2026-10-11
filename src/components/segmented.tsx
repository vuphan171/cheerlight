import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, UI } from '@/configs/ui';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}

export function Segmented<T extends string>({ options, value, onChange, compact }: SegmentedProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, compact && styles.optionCompact, selected && styles.optionSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: RADIUS,
    backgroundColor: UI.surfaceRaised,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
  },
  optionCompact: { flex: 0, paddingHorizontal: 14, paddingVertical: 10 },
  optionSelected: { backgroundColor: UI.accent, borderColor: UI.accent },
  label: { color: UI.textMuted, fontSize: 14, fontWeight: '600' },
  labelSelected: { color: UI.text },
});
