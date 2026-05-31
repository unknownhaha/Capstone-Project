"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getMissingProfileFields,
  isProfileComplete,
  type ProfileLike,
} from "@/lib/profile-complete";

export function useProfileComplete(enabled: boolean) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [complete, setComplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
      if (!res.ok) return;

      const data = await res.json();
      const user = data.user as ProfileLike;

      setComplete(isProfileComplete(user));
      setMissingFields(getMissingProfileFields(user));
    } finally {
      setLoading(false);
    }
  }, [enabled, session?.user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [enabled, refresh]);

  return { loading, complete, missingFields, refresh };
}
