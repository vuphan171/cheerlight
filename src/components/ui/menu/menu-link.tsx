import type React from 'react';
import { Text } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { MenuRow, menuValueStyle } from '@/components/ui/menu/menu-row';
import { UI } from '@/configs/ui';

interface Props {
  title: string;
  icon?: { name: IconName; color: string };
  value?: string;
  onPress: () => void;
  disabled?: boolean;
}

const MenuLink: React.FC<Props> = ({ title, icon, value, onPress, disabled }) => {
  return (
    <MenuRow
      title={title}
      icon={icon}
      onPress={onPress}
      disabled={disabled}
      trailing={
        <>
          {value ? (
            <Text style={menuValueStyle} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          <Icon name="chevron-forward" size={18} color={UI.chevron} />
        </>
      }
    />
  );
};

export { MenuLink };
