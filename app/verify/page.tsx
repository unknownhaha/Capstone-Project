"use client";
import "./verify.moudule.css";
import { useRef, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    inputs.current[index]!.value = value.slice(-1);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !inputs.current[index]!.value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const getOTPCode = () => {
    return inputs.current.map((input) => input?.value || "").join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = getOTPCode();
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Verification failed");
          return;
        }

        // Redirect to login on success
        router.push("/login");
      } catch (err) {
        setError("Something went wrong. Please try again.");
        console.error(err);
      }
    });
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/verify-otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setError(null);
      // Clear inputs
      inputs.current.forEach((input) => {
        if (input) input.value = "";
      });
      inputs.current[0]?.focus();
      alert("New OTP sent to your email!");
    } catch (err) {
      setError("Failed to resend OTP");
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container">
      <div className="box">
        {/* Icon */}
        <div className="icon">📱</div>

        <h2>Verify Code</h2>
        <p className="desc">
          We've sent you a one-time code to {email}. Enter it below to verify your email.
        </p>

        {error && (
          <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit}>
          <div className="otp">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otpInput"
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                disabled={isPending}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button 
            type="button" 
            className="resend" 
            onClick={handleResend}
            disabled={isResending || isPending}
            style={{ cursor: isResending || isPending ? "not-allowed" : "pointer" }}
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>

          <button 
            className="submit" 
            disabled={isPending}
            style={{ cursor: isPending ? "not-allowed" : "pointer" }}
          >
            {isPending ? "Verifying..." : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  );
}

