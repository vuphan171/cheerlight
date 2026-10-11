import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/floating-tab-bar';
import { UI } from '@/configs/ui';
import { usePortrait } from '@/hooks/use-landscape';

export default function TabsLayout() {
  usePortrait();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: UI.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Mẫu' }} />
      <Tabs.Screen name="create" options={{ title: 'Tạo' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt' }} />
    </Tabs>
  );
}
