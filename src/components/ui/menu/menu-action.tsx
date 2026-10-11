import type React from 'react';

import { MenuRow } from '@/components/ui/menu/menu-row';
import { UI } from '@/configs/ui';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const MenuAction: React.FC<Props> = ({ title, onPress, disabled }) => {
  return <MenuRow title={title} titleColor={UI.accent} onPress={onPress} disabled={disabled} />;
};

export { MenuAction };
