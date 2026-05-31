/** API routes that must work without a session (registration, sign-in, OTP). */
export function isPublicApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/auth/");
}
