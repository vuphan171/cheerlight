import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TYPE } from '@/configs/ui';

export function LargeTitle({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {children}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
  },
  title: { ...TYPE.largeTitle, flexShrink: 1 },
});
