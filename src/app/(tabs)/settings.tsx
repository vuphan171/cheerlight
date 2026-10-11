import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AboutSection } from '@/features/settings/about-section';
import { DisplaySection } from '@/features/settings/display-section';
import { FlashSection } from '@/features/settings/flash-section';
import { SafetySection } from '@/features/settings/safety-section';
import { LargeTitle } from '@/components/ui/large-title';
import { GROUP_GAP, SPACING, TAB_BAR_CLEARANCE, UI } from '@/configs/ui';
import { useStrings } from '@/i18n';

const SettingsScreen = () => {
  const t = useStrings();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <LargeTitle>{t.settings.title}</LargeTitle>
        <DisplaySection />
        <FlashSection />
        <SafetySection />
        <AboutSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UI.bg },
  content: { paddingHorizontal: SPACING, paddingBottom: TAB_BAR_CLEARANCE, gap: GROUP_GAP },
});

export default SettingsScreen;
