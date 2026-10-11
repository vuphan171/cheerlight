import type { EditorTabProps } from '@/components/create/types';
import { EFFECT_META } from '@/components/effect-meta';
import { GroupedSection } from '@/components/ui/grouped-section';
import { ListRow } from '@/components/ui/list-row';
import { Slider } from '@/components/ui/slider';
import { EFFECTS, SPEED_MAX, SPEED_MIN } from '@/configs/effects';
import { UI } from '@/configs/ui';
import type { EffectMode } from '@/types/settings';

interface EffectTabProps extends EditorTabProps {
  /** Chọn hiệu ứng qua `useEffectChooser` (chặn cảnh báo Strobe lần đầu). */
  chooseEffect: (mode: EffectMode) => void;
}

export function EffectTab({ settings, update, chooseEffect }: EffectTabProps) {
  return (
    <>
      <GroupedSection label="Hiệu ứng">
        {EFFECTS.map(({ mode, label }, i) => {
          const meta = EFFECT_META[mode];
          return (
            <ListRow
              key={mode}
              title={label}
              subtitle={meta.description}
              subtitleColor={mode === 'strobe' ? UI.danger : undefined}
              icon={{ name: meta.icon, color: meta.color }}
              checked={settings.effect === mode}
              accessibilityRole="radio"
              onPress={() => chooseEffect(mode)}
              last={i === EFFECTS.length - 1}
            />
          );
        })}
      </GroupedSection>
      {settings.effect !== 'solid' ? (
        <GroupedSection label="Tốc độ" list={false}>
          <Slider
            value={settings.speed}
            min={SPEED_MIN}
            max={SPEED_MAX}
            onChange={(speed) => update({ speed })}
            minLabel="Chậm"
            maxLabel="Nhanh"
            accessibilityLabel="Tốc độ hiệu ứng"
          />
        </GroupedSection>
      ) : null}
    </>
  );
}
