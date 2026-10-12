import type React from 'react';

import { ColorTab } from '@/features/create/color-tab';
import { EffectTab } from '@/features/create/effect-tab';
import { FlashTab } from '@/features/create/flash-tab';
import { TextTab } from '@/features/create/text-tab';
import type { EditorTabProps } from '@/features/create/types';
import type { SubTab } from '@/features/create/use-sub-tab';
import type { EffectMode } from '@/types/settings';

interface Props extends EditorTabProps {
  tab: SubTab;
  chooseEffect: (mode: EffectMode) => void;
}

const SubTabContent: React.FC<Props> = ({ tab, chooseEffect, ...props }) => {
  switch (tab) {
    case 'color':
      return <ColorTab {...props} />;
    case 'effect':
      return <EffectTab {...props} chooseEffect={chooseEffect} />;
    case 'text':
      return <TextTab {...props} />;
    case 'flash':
      return <FlashTab {...props} />;
  }
};

export { SubTabContent };
