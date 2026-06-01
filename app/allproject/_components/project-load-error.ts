export type ProjectLoadErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "unknown";

export function projectLoadErrorFromResponse(
  res: Response | null,
  caught: boolean
): ProjectLoadErrorKind {
  if (caught || !res) return "network";
  if (res.status === 401) return "unauthorized";
  if (res.status === 403) return "forbidden";
  if (res.status >= 500) return "server";
  return "unknown";
}

export function projectLoadErrorCopy(kind: ProjectLoadErrorKind): {
  titleEn: string;
  titleTh: string;
  detailEn?: string;
} {
  switch (kind) {
    case "network":
      return {
        titleEn: "Could not reach the server.",
        titleTh: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้",
        detailEn: "Check your connection and try again.",
      };
    case "unauthorized":
      return {
        titleEn: "Your session expired.",
        titleTh: "เซสชันหมดอายุ",
        detailEn: "Sign in again to load your projects.",
      };
    case "forbidden":
      return {
        titleEn: "You do not have access to these projects.",
        titleTh: "คุณไม่มีสิทธิ์เข้าถึงโครงการ",
      };
    case "server":
      return {
        titleEn: "The server could not load projects.",
        titleTh: "เซิร์ฟเวอร์โหลดโครงการไม่สำเร็จ",
        detailEn: "Try again in a moment.",
      };
    default:
      return {
        titleEn: "Could not load projects.",
        titleTh: "โหลดโครงการไม่สำเร็จ",
        detailEn: "Try again.",
      };
  }
}
