import type React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { EFFECT_META } from '@/components/effect-meta';
import { Icon } from '@/components/ui/icon';
import { PlayButton } from '@/components/ui/play-button';
import { effectLabel } from '@/configs/presets';
import { PreviewFrame } from '@/features/create/preview-frame';
import { useStrings } from '@/i18n';
import type { LightSettings } from '@/types/settings';

interface Props {
  settings: LightSettings;
  onPlay: () => void;
}

const PreviewPanel: React.FC<Props> = ({ settings, onPlay }) => {
  const t = useStrings();
  const { theme } = useUnistyles();

  return (
    <PreviewFrame settings={settings}>
      <View style={styles.badge} pointerEvents="none">
        <Icon
          name={EFFECT_META[settings.effect].icon}
          size={theme.fontSize(1)}
          color={theme.playColors.label}
        />
        <Text style={styles.badgeLabel}>{effectLabel(settings.effect, t)}</Text>
      </View>
      <View style={styles.play}>
        <PlayButton onPress={onPlay} />
      </View>
    </PreviewFrame>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    position: 'absolute',
    top: theme.space(2),
    left: theme.space(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1),
    paddingHorizontal: theme.space(2),
    paddingVertical: theme.space(1),
    borderRadius: theme.radii.full,
    backgroundColor: theme.playColors.chip,
  },
  badgeLabel: {
    fontSize: theme.fontSize(1),
    fontWeight: '600',
    color: theme.playColors.label,
  },
  play: {
    position: 'absolute',
    right: theme.space(3),
    bottom: theme.space(3),
  },
}));

export { PreviewPanel };
