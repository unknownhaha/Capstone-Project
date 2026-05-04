"use client";
import "./verify.moudule.css";
import { useRef } from "react";
export default function VerifyPage() {
const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (value: string, index: number) => {
    if (!value) return;

    if (index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="container">
      <div className="box">

        {/* Icon */}
        <div className="icon">📱</div>

        <h2>Verify Code</h2>
        <p className="desc">
          We've sent you a one-time code. Enter it below to verify your identity.
        </p>

        {/* OTP Inputs */}
        <div className="otp">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              maxLength={1}
              className="otpInput"
              ref={(el) => {
                 inputs.current[i] = el;}}
              onChange={(e) => handleChange(e.target.value, i)}
            />
          ))}
        </div>

        <p className="resend">Resend Code</p>

        <button className="submit">SUBMIT</button>
      </div>
    </div>
  );
}

