import { Children, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RADII, SPACING, TYPE, UI } from '@/configs/ui';

interface GroupedSectionProps {
  label?: string;
  footer?: string;
  children: ReactNode;
  /** `false` khi nội dung không phải dòng list (lưới màu, slider…) → có padding. */
  list?: boolean;
}

/** Nhóm kiểu iOS: nhãn IN HOA, khối trắng bo góc, chú thích tuỳ chọn. */
export function GroupedSection({ label, footer, children, list = true }: GroupedSectionProps) {
  return (
    <View style={styles.section}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.body, !list && styles.padded]}>{Children.toArray(children).filter(Boolean)}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 7, flexShrink: 0 },
  label: { ...TYPE.groupLabel, paddingHorizontal: SPACING },
  body: { backgroundColor: UI.surface, borderRadius: RADII.group, overflow: 'hidden' },
  padded: { padding: SPACING, gap: 14 },
  footer: { ...TYPE.caption, paddingHorizontal: SPACING },
});
