import type React from 'react';
import { Children, isValidElement, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MenuRowLastContext } from '@/components/ui/menu/menu-row';
import { RADII, SPACING, TYPE, UI } from '@/configs/ui';

interface Props {
  label?: string;
  footer?: string;
  children: ReactNode;
  list?: boolean;
}

const MenuGroup: React.FC<Props> = ({ label, footer, children, list = true }) => {
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.section}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.body, !list && styles.padded]}>
        {rows.map((row, i) => (
          <MenuRowLastContext.Provider
            key={isValidElement(row) ? row.key : i}
            value={i === rows.length - 1}>
            {row}
          </MenuRowLastContext.Provider>
        ))}
      </View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: 7, flexShrink: 0 },
  label: { ...TYPE.groupLabel, paddingHorizontal: SPACING },
  body: { backgroundColor: UI.surface, borderRadius: RADII.group, overflow: 'hidden' },
  padded: { padding: SPACING, gap: 14 },
  footer: { ...TYPE.caption, paddingHorizontal: SPACING },
});

export { MenuGroup };
