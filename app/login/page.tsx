"use client";

import Link from "next/link";
import styles from "./login.module.css";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function EyeIcon({ hidden }: { hidden?: boolean }) {
  if (hidden) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M10.5 10.677a2 2 0 0 0 2.846 2.846M9.9 4.24A10.66 10.66 0 0 1 12 4c5 0 9.27 3.11 11 7.5a11.6 11.6 0 0 1-2.08 3.42M6.12 6.12A10.66 10.66 0 0 0 3 11.5C4.73 15.89 9 19 14 19c1.01 0 1.98-.15 2.88-.42"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/allproject";
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "CredentialsSignin") {
      setError("Invalid email or password.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });

      if (result?.error || !result?.ok) {
        setError("Invalid email or password.");
        return;
      }

      const target = result.url ?? callbackUrl;
      const path = target.startsWith("http")
        ? new URL(target).pathname + new URL(target).search
        : target;

      router.replace(path);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.phone}>
        <header className={styles.hero}>
          <div className={styles.logoMark} aria-hidden>
            ♿
          </div>
          <h1 className={styles.heroTitle}>Welcome back</h1>
          <p className={styles.heroSubtitle}>
            Sign in to manage your accessibility inspections
          </p>
        </header>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={styles.input}
                disabled={isPending}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  className={styles.input}
                  disabled={isPending}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShow((prev) => !prev)}
                  disabled={isPending}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={show} />
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.errorBox} role="alert">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" name="remember" disabled={isPending} />
                Remember me
              </label>
              <button type="button" className={styles.forgot}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className={styles.signup}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className={styles.signupLink}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className={styles.shell}>
      <p className={styles.loading}>Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
