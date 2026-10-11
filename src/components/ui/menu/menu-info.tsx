import type React from 'react';
import { Text } from 'react-native';

import type { IconName } from '@/components/ui/icon';
import { MenuRow, menuValueStyle } from '@/components/ui/menu/menu-row';

interface Props {
  title: string;
  icon?: { name: IconName; color: string };
  value: string;
}

const MenuInfo: React.FC<Props> = ({ title, icon, value }) => {
  return (
    <MenuRow
      title={title}
      icon={icon}
      trailing={
        <Text style={menuValueStyle} numberOfLines={1}>
          {value}
        </Text>
      }
    />
  );
};

export { MenuInfo };
