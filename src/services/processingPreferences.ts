import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@claridad/processing-prefs:v1';

export type ProcessingPreferences = {
  highFidelity: boolean;
  autoTitle: boolean;
};

const DEFAULTS: ProcessingPreferences = {
  highFidelity: false,
  autoTitle: true,
};

export async function getProcessingPreferences(): Promise<ProcessingPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ProcessingPreferences>;
    return {
      highFidelity: parsed.highFidelity ?? DEFAULTS.highFidelity,
      autoTitle: parsed.autoTitle ?? DEFAULTS.autoTitle,
    };
  } catch {
    return DEFAULTS;
  }
}

export async function saveProcessingPreferences(prefs: ProcessingPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
