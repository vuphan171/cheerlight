import { describe, expect, it } from '@jest/globals';

import { SPEED_MAX, SPEED_MIN, TORCH_MIN_PERIOD_MS, torchPlan } from '@/configs/effects';
import type { EffectMode } from '@/types/settings';

const EFFECTS: EffectMode[] = ['solid', 'blink', 'strobe', 'rainbow'];

describe('torchPlan — không bao giờ quá 5 lần/giây', () => {
  for (const effect of EFFECTS) {
    for (let speed = SPEED_MIN; speed <= SPEED_MAX; speed++) {
      for (const torchSyncWithEffect of [true, false]) {
        it(`${effect} speed ${speed} sync ${torchSyncWithEffect}`, () => {
          for (let torchRate = SPEED_MIN; torchRate <= SPEED_MAX; torchRate++) {
            const plan = torchPlan({
              torchEnabled: true,
              torchSyncWithEffect,
              torchMode: 'blink',
              torchRate,
              effect,
              speed,
            });
            if (plan.kind === 'timer')
              expect(plan.periodMs).toBeGreaterThanOrEqual(TORCH_MIN_PERIOD_MS);
          }
        });
      }
    }
  }
});
