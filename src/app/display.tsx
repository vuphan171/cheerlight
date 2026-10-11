import { useKeepAwake } from 'expo-keep-awake';
import { NavigationBar } from 'expo-navigation-bar';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useLandscape } from '@/hooks/useLandscape';
import { useMaxBrightness } from '@/hooks/useMaxBrightness';
import { useSettings } from '@/hooks/useSettings';

export default function DisplayScreen() {
  useKeepAwake();
  useLandscape();
  useMaxBrightness();
  const { settings } = useSettings();
  // Chỉ ẩn thanh hệ thống khi màn hình đang focus (có thể còn mount phía dưới stack).
  const focused = useIsFocused();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: settings.backgroundColor }]}
      onPress={() => router.back()}>
      <StatusBar hidden={focused} style="light" />
      <NavigationBar hidden={focused} />
      <Text style={styles.hint}>Chạm để quay lại</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#FFFFFF' },
});
