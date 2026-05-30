import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@claridad/plan-mode:v1';

export type PlanMode = 'free' | 'pro';

export async function getPlanMode(): Promise<PlanMode> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === 'pro' ? 'pro' : 'free';
  } catch {
    return 'free';
  }
}

export async function savePlanMode(mode: PlanMode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, mode);
}

export function isProPlan(mode: PlanMode): boolean {
  return mode === 'pro';
}
