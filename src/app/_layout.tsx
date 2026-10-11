import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SettingsProvider } from '@/components/settings-provider';
import { FONT_ASSETS } from '@/configs/fonts';
import { UI } from '@/configs/ui';
import { useSettings } from '@/hooks/use-settings';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Mở thẳng `display` qua deep link thì vẫn có các tab bên dưới để quay lại.
export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontError) console.warn('[fonts] load failed, dùng font hệ thống', fontError);
  }, [fontError]);

  return (
    <SettingsProvider>
      <AppNavigator fontsReady={fontsLoaded || fontError !== null} />
    </SettingsProvider>
  );
}

/** Giữ splash tới khi font và cài đặt đã lưu được nạp xong, tránh nháy giá trị mặc định. */
function AppNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { loaded } = useSettings();
  const ready = fontsReady && loaded;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: UI.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="display"
          options={{
            animation: 'fade',
            autoHideHomeIndicator: true,
            contentStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack>
    </>
  );
}
