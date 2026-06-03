"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import loginStyles from "../login/login.module.css";
import styles from "./register.module.css";

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

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Registration failed. Please try again.");
          return;
        }

        const verifyUrl = new URLSearchParams({ email: data.email });
        if (data.emailSent === false) {
          verifyUrl.set("emailFailed", "1");
        }
        router.push(`/verify?${verifyUrl.toString()}`);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className={`${loginStyles.shell} ${styles.scrollShell}`}>
      <div className={`${loginStyles.phone} ${styles.phoneTall}`}>
        <header className={loginStyles.hero}>
          <div className={loginStyles.logoMark} aria-hidden>
            ♿
          </div>
          <h1 className={loginStyles.heroTitle}>Create account</h1>
          <p className={loginStyles.heroSubtitle}>
            Join to start your accessibility inspections
          </p>
        </header>

        <div className={loginStyles.card}>
          <form className={loginStyles.form} onSubmit={handleSubmit}>
            <div className={styles.nameRow}>
              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  className={loginStyles.input}
                  disabled={isPending}
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className={loginStyles.field}>
                <label className={loginStyles.label} htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  className={loginStyles.input}
                  disabled={isPending}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className={loginStyles.field}>
              <label className={loginStyles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={loginStyles.input}
                disabled={isPending}
                autoComplete="email"
                required
              />
            </div>

            <div className={loginStyles.field}>
              <label className={loginStyles.label} htmlFor="password">
                Password
              </label>
              <div className={loginStyles.passwordWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={loginStyles.input}
                  disabled={isPending}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={loginStyles.togglePassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showPassword} />
                </button>
              </div>
            </div>

            <div className={loginStyles.field}>
              <label className={loginStyles.label} htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className={loginStyles.passwordWrap}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={loginStyles.input}
                  disabled={isPending}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={loginStyles.togglePassword}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={!showConfirm} />
                </button>
              </div>
            </div>

            {error && (
              <div className={loginStyles.errorBox} role="alert">
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

            <button
              type="submit"
              className={loginStyles.loginBtn}
              disabled={isPending}
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{" "}
            <Link href="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
