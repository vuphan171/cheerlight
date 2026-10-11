import Constants from 'expo-constants';

import { MenuGroup } from '@/components/ui/menu/menu-group';
import { MenuInfo } from '@/components/ui/menu/menu-info';
import { useStrings } from '@/i18n';

/** Nhóm cuối: phiên bản app và font. */
const AboutSection = () => {
  const t = useStrings();

  return (
    <MenuGroup>
      <MenuInfo title={t.settings.version} value={Constants.expoConfig?.version ?? '—'} />
      <MenuInfo title={t.settings.ledFont} value="Tiny5 · OFL" />
    </MenuGroup>
  );
};

export { AboutSection };
