import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EFFECT_META } from '@/components/effect-meta';
import type { MenuAnchor } from '@/components/ui/context-menu';
import { Icon } from '@/components/ui/icon';
import { RainbowFill } from '@/components/ui/rainbow-fill';
import { resolveTextColor } from '@/configs/colors';
import { presetSummary } from '@/configs/presets';
import { RADII } from '@/configs/ui';
import { useStrings } from '@/i18n';
import type { Preset } from '@/types/settings';

interface PresetTileProps {
  preset: Preset;
  width: number;
  onPlay: () => void;
  onOpenMenu: (anchor: MenuAnchor) => void;
}

/** Ô mẫu trong lưới: chạm để phát, ⋯ hoặc nhấn giữ để mở menu. */
export function PresetTile({ preset, width, onPlay, onOpenMenu }: PresetTileProps) {
  const t = useStrings();
  const { settings } = preset;
  const fg = resolveTextColor(settings);
  const moreRef = useRef<View>(null);
  const tileRef = useRef<View>(null);

  const open = (target: View | null) => {
    target?.measureInWindow((x, y, w, h) => onOpenMenu({ x, y, width: w, height: h }));
  };

  return (
    <Pressable
      ref={tileRef}
      onPress={onPlay}
      onLongPress={() => open(moreRef.current ?? tileRef.current)}
      style={({ pressed }) => [
        styles.tile,
        { width, backgroundColor: settings.backgroundColor },
        pressed && styles.pressed,
      ]}>
      {settings.effect === 'rainbow' ? <RainbowFill /> : null}
      <View style={styles.top}>
        <View>
          <Icon name={EFFECT_META[settings.effect].icon} size={20} color={fg} />
        </View>
        <Pressable ref={moreRef} onPress={() => open(moreRef.current)} style={styles.more}>
          <Icon name="ellipsis-horizontal" size={22} color={fg} />
        </Pressable>
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.name, { color: fg }]} numberOfLines={2}>
          {preset.name}
        </Text>
        <Text style={[styles.summary, { color: fg }]} numberOfLines={1}>
          {presetSummary(settings, t)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 132,
    borderRadius: RADII.tile,
    overflow: 'hidden',
    padding: 14,
    paddingTop: 6,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: -10,
  },
  more: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bottom: { gap: 2 },
  name: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  summary: { fontSize: 13, opacity: 0.85 },
});
