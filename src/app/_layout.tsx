import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SettingsProvider } from '@/components/SettingsProvider';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0B0B12' },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: '#0B0B12' },
        }}>
        <Stack.Screen name="index" options={{ title: 'CheerLight' }} />
        <Stack.Screen
          name="display"
          options={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#000' } }}
        />
      </Stack>
    </SettingsProvider>
  );
}
