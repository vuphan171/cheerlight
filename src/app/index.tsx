import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { usePortrait } from '@/hooks/useLandscape';

export default function SettingsScreen() {
  usePortrait();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.startButton} onPress={() => router.push('/display')}>
        <Text style={styles.startLabel}>Bắt đầu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 24 },
  startButton: {
    backgroundColor: '#FF00E6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});
