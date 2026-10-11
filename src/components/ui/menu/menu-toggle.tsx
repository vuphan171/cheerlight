import type React from 'react';

import type { IconName } from '@/components/ui/icon';
import { MenuRow } from '@/components/ui/menu/menu-row';
import { Toggle } from '@/components/ui/toggle';

interface Props {
  title: string;
  icon?: { name: IconName; color: string };
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const MenuToggle: React.FC<Props> = ({ title, icon, value, onValueChange }) => {
  return (
    <MenuRow
      title={title}
      icon={icon}
      trailing={<Toggle value={value} onValueChange={onValueChange} />}
    />
  );
};

export { MenuToggle };
