/** UploadThing client/server file shapes vary by version; normalize URL fields. */
export type UploadFileLike = {
  ufsUrl?: string | null;
  url?: string | null;
  appUrl?: string | null;
  fileUrl?: string | null;
  serverData?: { url?: string | null; ufsUrl?: string | null };
};

export function pickUploadFileUrl(
  file: UploadFileLike | null | undefined
): string | null {
  if (!file) return null;
  return (
    file.ufsUrl ??
    file.url ??
    file.appUrl ??
    file.fileUrl ??
    file.serverData?.url ??
    file.serverData?.ufsUrl ??
    null
  );
}
