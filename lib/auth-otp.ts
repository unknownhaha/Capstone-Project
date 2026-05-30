/** Accounts created before OTP registration are allowed to log in without verification. */
export const OTP_FEATURE_CUTOFF = new Date("2026-05-01T00:00:00.000Z");

export function isLegacyUser(createdAt?: Date | null): boolean {
  if (!createdAt) return true;
  return createdAt < OTP_FEATURE_CUTOFF;
}
