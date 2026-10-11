import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EFFECTS } from '@/constants/effects';
import { RADIUS, UI } from '@/constants/ui';
import type { EffectMode } from '@/types/settings';

interface EffectSelectorProps {
  value: EffectMode;
  onChange: (mode: EffectMode) => void;
  compact?: boolean;
}

export function EffectSelector({ value, onChange, compact = false }: EffectSelectorProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {EFFECTS.map(({ mode, label }) => {
        const selected = mode === value;
        return (
          <Pressable
            key={mode}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(mode)}
            style={[styles.option, compact && styles.optionCompact, selected && styles.optionSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
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
