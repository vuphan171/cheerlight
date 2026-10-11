import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider } from '@/components/settings-provider';
import { SplashGate } from '@/components/splash-gate';
import { PLAY_UI, UI } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';

SplashScreen.preventAutoHideAsync().catch(() => {});

const unstable_settings = { anchor: '(tabs)' };

const RootStack = () => {
  const { loaded } = useSettings();

  return (
    <SplashGate ready={loaded}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: UI.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="display"
          options={{
            animation: 'fade',
            autoHideHomeIndicator: true,
            contentStyle: { backgroundColor: PLAY_UI.bg },
          }}
        />
      </Stack>
    </SplashGate>
  );
};

const RootLayout = () => (
  <SettingsProvider>
    <RootStack />
  </SettingsProvider>
);

export { unstable_settings };
export default RootLayout;
