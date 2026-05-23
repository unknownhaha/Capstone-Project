"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      redirected.current = false;
      return;
    }

    if (redirected.current) return;

    redirected.current = true;
    const callback = encodeURIComponent(pathname || "/allproject");
    router.replace(`/login?callbackUrl=${callback}`);
  }, [status, router, pathname]);

  return { session, status, isAuthenticated: status === "authenticated" };
}
