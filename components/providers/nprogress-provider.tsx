"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

function NProgressInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      NProgress.start();
    }
    prevPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export default function NProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <NProgressInner>{children}</NProgressInner>
    </Suspense>
  );
}
