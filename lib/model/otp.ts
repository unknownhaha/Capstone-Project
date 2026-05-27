import mongoose from "mongoose";

export interface IOTP {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt?: Date;
}

const otpSchema = new mongoose.Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema);

export default OTP;
