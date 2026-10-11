import type React from 'react';

import { Icon, type IconName } from '@/components/ui/icon';
import { MenuRow } from '@/components/ui/menu/menu-row';
import { UI } from '@/configs/ui';

interface Props {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  icon?: { name: IconName; color: string };
  selected: boolean;
  onPress: () => void;
}

const MenuOption: React.FC<Props> = ({
  title,
  subtitle,
  subtitleColor,
  icon,
  selected,
  onPress,
}) => {
  return (
    <MenuRow
      title={title}
      subtitle={subtitle}
      subtitleColor={subtitleColor}
      icon={icon}
      onPress={onPress}
      trailing={selected ? <Icon name="checkmark" size={22} color={UI.accent} /> : null}
    />
  );
};

export { MenuOption };
