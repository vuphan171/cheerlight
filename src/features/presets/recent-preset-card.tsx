import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PlayButton } from '@/components/ui/play-button';
import { RainbowFill } from '@/components/ui/rainbow-fill';
import { resolveTextColor } from '@/configs/colors';
import { fontFamilyFor } from '@/configs/fonts';
import { presetSummary } from '@/configs/presets';
import { RADII } from '@/configs/ui';
import { useStrings } from '@/i18n';
import type { Preset } from '@/types/settings';

export function RecentPresetCard({ preset, onPlay }: { preset: Preset; onPlay: () => void }) {
  const t = useStrings();
  const { settings } = preset;
  const fg = resolveTextColor(settings);
  const text = settings.text.trim();

  return (
    <Pressable
      onPress={onPlay}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: settings.backgroundColor },
        pressed && styles.pressed,
      ]}>
      {settings.effect === 'rainbow' ? <RainbowFill /> : null}
      <Text style={[styles.kicker, { color: fg }]}>{t.presets.recent}</Text>
      <Text
        style={[styles.marquee, { color: fg, fontFamily: fontFamilyFor(settings.textFont) }]}
        numberOfLines={1}
        allowFontScaling={false}>
        {text || ' '}
      </Text>
      <View style={styles.footer}>
        <View style={styles.footerText}>
          <Text style={[styles.name, { color: fg }]} numberOfLines={1}>
            {preset.name}
          </Text>
          <Text style={[styles.summary, { color: fg }]} numberOfLines={1}>
            {presetSummary(settings, t)}
          </Text>
        </View>
        <PlayButton onPress={onPlay} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 196,
    flexShrink: 0,
    borderRadius: RADII.recentCard,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pressed: { opacity: 0.9 },
  kicker: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', opacity: 0.85 },
  marquee: { fontSize: 40, lineHeight: 50 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  footerText: { flex: 1, gap: 2 },
  name: { fontSize: 22, fontWeight: '700' },
  summary: { fontSize: 13, opacity: 0.85 },
});
