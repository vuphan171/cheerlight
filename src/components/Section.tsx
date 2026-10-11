import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RADIUS, SPACING, UI } from '@/constants/ui';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  title: {
    color: UI.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: { backgroundColor: UI.surface, borderRadius: RADIUS * 1.5, padding: SPACING, gap: 16 },
});
