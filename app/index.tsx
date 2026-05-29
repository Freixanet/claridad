import { Redirect } from 'expo-router';

import { ClaridadRoutes } from '@/types';

/** Demo entry: start at onboarding 1 (full product narrative). */
export default function IndexScreen() {
  return <Redirect href={ClaridadRoutes.onboarding1} />;
}
