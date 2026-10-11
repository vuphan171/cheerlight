import type { EditorTabProps } from '@/features/create/types';
import { EFFECT_META } from '@/components/effect-meta';
import { MenuGroup } from '@/components/ui/menu-group';
import { MenuItem } from '@/components/ui/menu-item';
import { Slider } from '@/components/ui/slider';
import { EFFECTS, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { UI } from '@/configs/ui';
import type { EffectMode } from '@/types/settings';
import { useStrings } from '@/i18n';

interface EffectTabProps extends EditorTabProps {
  /** Chọn hiệu ứng qua `useEffectChooser` (chặn cảnh báo Strobe lần đầu). */
  chooseEffect: (mode: EffectMode) => void;
}

export function EffectTab({ settings, update, chooseEffect }: EffectTabProps) {
  const t = useStrings();
  return (
    <>
      <MenuGroup label={t.effectTab.effect}>
        {EFFECTS.map((mode, i) => {
          const meta = EFFECT_META[mode];
          return (
            <MenuItem
              key={mode}
              title={t.effects[mode].label}
              subtitle={t.effects[mode].description}
              subtitleColor={mode === 'strobe' ? UI.danger : undefined}
              icon={{ name: meta.icon, color: meta.color }}
              checked={settings.effect === mode}
              accessibilityRole="radio"
              onPress={() => chooseEffect(mode)}
              last={i === EFFECTS.length - 1}
            />
          );
        })}
      </MenuGroup>
      {settings.effect !== 'solid' ? (
        <MenuGroup label={t.effectTab.speed} list={false}>
          <Slider
            value={settings.speed}
            min={SPEED_MIN}
            max={SPEED_MAX}
            onChange={(speed) => update({ speed })}
            minLabel={t.common.slow}
            maxLabel={t.common.fast}
            accessibilityLabel={t.effectTab.speedA11y}
          />
        </MenuGroup>
      ) : null}
    </>
  );
}
