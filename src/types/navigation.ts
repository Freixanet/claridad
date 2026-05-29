/** Canonical routes for the 15 definitive Claridad screens. */
export const ClaridadRoutes = {
  onboarding1: '/(onboarding)/chaos-to-order',
  onboarding2: '/(onboarding)/photograph-page',
  onboarding3: '/(onboarding)/fragments-detected',
  onboarding4: '/(onboarding)/grouped-by-topics',
  onboarding5: '/(onboarding)/review-before-trust',
  auth: '/(auth)/login',
  home: '/(app)/home',
  empty: '/(app)/empty',
  capture: '/(capture)/capture',
  processing: '/(capture)/processing',
  result: '/(document)/result',
  review: '/(document)/review',
  export: '/(document)/export',
  document: '/(document)/doc-ideas-proyecto',
  settings: '/settings',
} as const;

export type ClaridadRouteKey = keyof typeof ClaridadRoutes;
