import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/floating-tab-bar';
import { UI } from '@/configs/ui';
import { usePortrait } from '@/hooks/use-landscape';
import { useStrings } from '@/i18n';

export default function TabsLayout() {
  usePortrait();
  const t = useStrings();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: UI.bg } }}>
      <Tabs.Screen name="index" options={{ title: t.tabs.presets }} />
      <Tabs.Screen name="create" options={{ title: t.tabs.create }} />
      <Tabs.Screen name="settings" options={{ title: t.tabs.settings }} />
    </Tabs>
  );
}
