import Constants from 'expo-constants';

import { MenuGroup } from '@/components/ui/menu-group';
import { MenuItem } from '@/components/ui/menu-item';
import { useStrings } from '@/i18n';

/** Nhóm cuối: phiên bản app và font. */
const AboutSection = () => {
  const t = useStrings();

  return (
    <MenuGroup>
      <MenuItem title={t.settings.version} value={Constants.expoConfig?.version ?? '—'} />
      <MenuItem title={t.settings.ledFont} value="Tiny5 · OFL" last />
    </MenuGroup>
  );
};

export { AboutSection };
