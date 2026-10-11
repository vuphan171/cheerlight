import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SettingsProvider } from '@/components/SettingsProvider';
import { FONT_ASSETS } from '@/constants/fonts';
import { UI } from '@/constants/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontError) console.warn('[fonts] load failed, dùng font hệ thống', fontError);
    if (ready) SplashScreen.hide();
  }, [ready, fontError]);

  if (!ready) return null;

  return (
    <SettingsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: UI.background },
          headerTintColor: UI.text,
          contentStyle: { backgroundColor: UI.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'CheerLight' }} />
        <Stack.Screen
          name="display"
          options={{
            headerShown: false,
            animation: 'fade',
            autoHideHomeIndicator: true,
            contentStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack>
    </SettingsProvider>
  );
}
