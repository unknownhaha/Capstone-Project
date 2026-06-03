"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getMissingProfileFields,
  isProfileComplete,
  type ProfileLike,
} from "@/lib/profile-complete";
import {
  projectLoadErrorFromResponse,
  type ProjectLoadErrorKind,
} from "./project-load-error";
import type { ApiProject } from "./project-utils";

function applyProfileState(
  user: ProfileLike | undefined,
  setComplete: (v: boolean) => void,
  setMissingFields: (v: string[]) => void
) {
  if (!user) return;
  setComplete(isProfileComplete(user));
  setMissingFields(getMissingProfileFields(user));
}

/** Loads project list + profile completeness in one round-trip (Promise.all). */
export function useDashboardData(isAuthenticated: boolean) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [complete, setComplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<ProjectLoadErrorKind | null>(null);

  const refreshAll = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId || !isAuthenticated) {
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    setLoading(true);
    setProfileLoading(true);
    setLoadError(null);

    try {
      const [projectsRes, profileRes] = await Promise.all([
        fetch("/api/project", { credentials: "include" }),
        fetch(`/api/users/${userId}`, { credentials: "include" }),
      ]);

      if (!projectsRes.ok) {
        setLoadError(projectLoadErrorFromResponse(projectsRes, false));
      } else {
        setProjects((await projectsRes.json()) as ApiProject[]);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        applyProfileState(data.user as ProfileLike, setComplete, setMissingFields);
      }
    } catch {
      setLoadError(projectLoadErrorFromResponse(null, true));
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }, [isAuthenticated, session?.user?.id]);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId || !isAuthenticated) return;

    setProfileLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      applyProfileState(data.user as ProfileLike, setComplete, setMissingFields);
    } finally {
      setProfileLoading(false);
    }
  }, [isAuthenticated, session?.user?.id]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshAll();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAuthenticated, refreshAll]);

  return {
    projects,
    setProjects,
    loading,
    profileLoading,
    complete,
    missingFields,
    loadError,
    refreshAll,
    refreshProfile,
  };
}
