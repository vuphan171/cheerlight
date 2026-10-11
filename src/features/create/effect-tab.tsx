import { EFFECT_META } from '@/components/effect-meta';
import { MenuGroup } from '@/components/ui/menu/menu-group';
import { MenuOption } from '@/components/ui/menu/menu-option';
import { Slider } from '@/components/ui/slider';
import { EFFECTS, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { UI } from '@/configs/ui';
import type { EditorTabProps } from '@/features/create/types';
import { useStrings } from '@/i18n';
import type { EffectMode } from '@/types/settings';

interface EffectTabProps extends EditorTabProps {
  /** Chọn hiệu ứng qua `useEffectChooser` (chặn cảnh báo Strobe lần đầu). */
  chooseEffect: (mode: EffectMode) => void;
}

export function EffectTab({ settings, update, chooseEffect }: EffectTabProps) {
  const t = useStrings();
  return (
    <>
      <MenuGroup label={t.effectTab.effect}>
        {EFFECTS.map((mode) => {
          const meta = EFFECT_META[mode];
          return (
            <MenuOption
              key={mode}
              title={t.effects[mode].label}
              subtitle={t.effects[mode].description}
              subtitleColor={mode === 'strobe' ? UI.danger : undefined}
              icon={{ name: meta.icon, color: meta.color }}
              selected={settings.effect === mode}
              onPress={() => chooseEffect(mode)}
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
          />
        </MenuGroup>
      ) : null}
    </>
  );
}
