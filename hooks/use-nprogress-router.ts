"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import NProgress from "nprogress";

export function useNProgressRouter(): AppRouterInstance {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const push = useCallback<AppRouterInstance["push"]>(
    (href, options) => {
      NProgress.start();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 8000);
      router.push(href, options);
    },
    [router],
  );

  const replace = useCallback<AppRouterInstance["replace"]>(
    (href, options) => {
      NProgress.start();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 8000);
      router.replace(href, options);
    },
    [router],
  );

  const refresh = useCallback<AppRouterInstance["refresh"]>(
    (...args) => {
      NProgress.start();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 8000);
      router.refresh(...args);
    },
    [router],
  );

  const back = useCallback<AppRouterInstance["back"]>(
    (...args) => {
      NProgress.start();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 8000);
      router.back(...args);
    },
    [router],
  );

  const forward = useCallback<AppRouterInstance["forward"]>(
    (...args) => {
      NProgress.start();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => NProgress.done(), 8000);
      router.forward(...args);
    },
    [router],
  );

  const prefetch = useCallback<AppRouterInstance["prefetch"]>(
    (...args) => {
      router.prefetch(...args);
    },
    [router],
  );

  return {
    push,
    replace,
    refresh,
    back,
    forward,
    prefetch,
  };
}
