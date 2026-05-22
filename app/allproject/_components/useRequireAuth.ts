"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const callback = encodeURIComponent(pathname || "/allproject");
      router.replace(`/login?callbackUrl=${callback}`);
    }
  }, [status, router, pathname]);

  return { session, status, isAuthenticated: status === "authenticated" };
}
