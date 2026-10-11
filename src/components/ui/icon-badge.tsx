import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';

export const ICON_BADGE_SIZE = 30;

export function IconBadge({ name, color }: { name: IconName; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Icon name={name} size={18} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: ICON_BADGE_SIZE,
    height: ICON_BADGE_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
