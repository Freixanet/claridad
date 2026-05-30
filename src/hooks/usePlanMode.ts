import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { getPlanMode, savePlanMode, type PlanMode } from '@/services/planMode';

export function usePlanMode() {
  const [planMode, setPlanMode] = useState<PlanMode>('free');

  useFocusEffect(
    useCallback(() => {
      void getPlanMode().then(setPlanMode);
    }, [])
  );

  const setPlan = useCallback(async (mode: PlanMode) => {
    setPlanMode(mode);
    await savePlanMode(mode);
  }, []);

  return {
    planMode,
    isPro: planMode === 'pro',
    setPlan,
  };
}
