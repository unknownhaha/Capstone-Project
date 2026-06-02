"use client";

import { Suspense, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./forgot-password.module.css";

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

function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  // Step 2 Form States
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const enteredEmail = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!enteredEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setEmail(enteredEmail);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: enteredEmail }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to send reset code.");
          return;
        }

        setStep(2);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    });
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError(null);
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }

      // Clear code inputs
      otpInputs.current.forEach((input) => {
        if (input) input.value = "";
      });
      otpInputs.current[0]?.focus();
      alert("A new code has been sent to your email!");
    } catch (err) {
      console.error(err);
      setError("Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  // OTP Change & Navigation helpers
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    otpInputs.current[index]!.value = value.slice(-1);
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpInputs.current[index]!.value && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const getOTPCode = () => {
    return otpInputs.current.map((input) => input?.value || "").join("");
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const code = getOTPCode();
    if (code.length !== 6) {
      setError("Please enter a 6-digit verification code.");
      return;
    }

    const formData = new FormData(e.currentTarget);
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
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Reset password failed.");
          return;
        }

        setSuccessMsg(data.message || "Password reset successfully!");
        setStep(3);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.icon} aria-hidden>
          {step === 1 && "🔑"}
          {step === 2 && "🔐"}
          {step === 3 && "✅"}
        </div>

        {step === 1 && (
          <>
            <h2 className={styles.title}>Forgot Password</h2>
            <p className={styles.desc}>
              Enter your email address and we will send you a 6-digit code to reset your password.
            </p>

            {error && <div className={styles.noticeError} role="alert">{error}</div>}

            <form onSubmit={handleRequestOTP} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={styles.input}
                  disabled={isPending}
                  required
                />
              </div>

              <button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Sending..." : "Send OTP"}
              </button>
            </form>

            <div className={styles.backToLogin}>
              <Link href="/login" className={styles.link}>
                Back to Login
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.desc}>
              We sent a 6-digit code to <strong>{email}</strong>. Enter the code and set your new password below.
            </p>

            {error && <div className={styles.noticeError} role="alert">{error}</div>}

            <form onSubmit={handleResetPassword} className={styles.form}>
              <label className={styles.label}>Verification Code</label>
              <div className={styles.otp}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.otpInput}
                    ref={(el) => {
                      otpInputs.current[i] = el;
                    }}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    disabled={isPending}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  New Password
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className={styles.input}
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isPending}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your new password"
                    className={styles.input}
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowConfirm((prev) => !prev)}
                    disabled={isPending}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon hidden={showConfirm} />
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submit} disabled={isPending}>
                {isPending ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                className={styles.resend}
                onClick={handleResendOTP}
                disabled={isResending || isPending}
              >
                {isResending ? "Resending..." : "Resend Code"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles.title}>Success!</h2>
            <p className={styles.desc}>
              {successMsg || "Your password has been reset successfully. You can now use your new password to sign in."}
            </p>

            <Link href="/login" className={styles.submitLink}>
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function ForgotPasswordFallback() {
  return (
    <div className={styles.container}>
      <p style={{ color: "white", textAlign: "center", marginTop: 40 }}>Loading...</p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
