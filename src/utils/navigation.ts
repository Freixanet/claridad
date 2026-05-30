import type { Href } from 'expo-router';

type RouterLike = {
  back: () => void;
  canGoBack: () => boolean;
  replace: (href: Href) => void;
};

export function goBackOr(router: RouterLike, fallbackHref: Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
