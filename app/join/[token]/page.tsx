"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./join.module.css";

export default function JoinProjectPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link.");
      return;
    }

    if (status === "loading") return;

    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(`/join/${token}`);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    let cancelled = false;

    async function join() {
      try {
        const res = await fetch(`/api/join/${encodeURIComponent(token)}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "Could not join this project.");
          return;
        }

        router.replace(`/allproject/${data.projectId}`);
      } catch {
        if (!cancelled) {
          setError("Could not join this project. Please try again.");
        }
      }
    }

    join();

    return () => {
      cancelled = true;
    };
  }, [status, token, router]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {error ? (
          <>
            <h1 className={styles.title}>Unable to join</h1>
            <p className={styles.message}>{error}</p>
            <Link href="/allproject" className={styles.link}>
              Back to projects
            </Link>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Joining project</h1>
            <p className={styles.message}>Please wait while we add you to the team…</p>
          </>
        )}
      </div>
    </main>
  );
}
