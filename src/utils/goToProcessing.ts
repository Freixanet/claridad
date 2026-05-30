import { InteractionManager } from 'react-native';
import type { ImperativeRouter } from 'expo-router/build/global-state/router';

/** Lets React commit cleared capture state before navigation snapshots run. */
export function afterCaptureStateCommitted(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Leave the capture modal without replace() so navigation persistence does not
 * try to serialize the heavy capture screen state (image asset) to storage.
 */
export async function goToProcessingScreen(router: ImperativeRouter): Promise<void> {
  await afterCaptureStateCommitted();
  if (router.canDismiss()) {
    router.dismissTo('/processing');
    return;
  }
  router.push('/processing');
}
