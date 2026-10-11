import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useSettings } from '@/hooks/useSettings';

export default function DisplayScreen() {
  const { settings } = useSettings();
  return (
    <Pressable
      style={[styles.container, { backgroundColor: settings.backgroundColor }]}
      onPress={() => router.back()}>
      <Text style={styles.hint}>Chạm để quay lại</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#FFFFFF' },
});
