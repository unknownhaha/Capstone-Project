"use client";

import styles from "./login.module.css";
import { useTransition, useState } from "react";
import { loginAction } from "./action";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>

        <div className={styles.avatar}>
          <div className={styles.avatarInner} />
        </div>

       

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={styles.input}
            disabled={isPending}
            required
          />
          <div className={styles.passwordContainer}>
            <input
              name="password"
              type={show ? "text" : "password"}
              placeholder="Password"
              className={styles.input}
            />
            <img
              src={show ? "/eye_hidden.png" : "/eye.png"}
              alt={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
              className={styles.togglePassword}
            />
          </div>
           {error && (
            <div className={styles.errorBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <div className={styles.options}>
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <span className={styles.forgot}>Forgot Password?</span>
          </div>

          <button className={styles.loginBtn} disabled={isPending}>
            {isPending ? "Signing in..." : "LOGIN"}
          </button>
        </form>

        <p className={styles.signup}>
          Don't have an account?{" "}
          <a href="/register" className={styles.signupLink}>
            Create account
          </a>
        </p>


      </div>
    </div>
  );
}
