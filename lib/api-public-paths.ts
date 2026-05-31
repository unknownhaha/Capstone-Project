/**
 * API routes that skip the global JWT middleware check.
 * - /api/auth/* — registration, sign-in, OTP
 * - /api/uploadthing — UploadThing client + server callbacks; auth per slug in route handler
 */
export function isPublicApiPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/uploadthing")) return true;
  return false;
}
