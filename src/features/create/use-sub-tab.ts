import { useState } from 'react';

type SubTab = 'color' | 'effect' | 'text' | 'flash';

const SUB_TABS: readonly SubTab[] = ['color', 'effect', 'text', 'flash'];

let lastSubTab: SubTab = 'color';

const useSubTab = () => {
  const [subTab, setSubTab] = useState<SubTab>(lastSubTab);

  const selectSubTab = (tab: SubTab) => {
    lastSubTab = tab;
    setSubTab(tab);
  };

  return [subTab, selectSubTab] as const;
};

export { SUB_TABS, useSubTab };
export type { SubTab };
