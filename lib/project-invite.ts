import crypto from "crypto";
import ProjectInvite from "@/lib/model/project-invite";

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function getOrCreateInvite(
  projectId: string,
  createdBy: string
) {
  const existing = await ProjectInvite.findOne({
    projectId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (existing) return existing;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return ProjectInvite.create({
    projectId,
    token: generateInviteToken(),
    createdBy,
    expiresAt,
  });
}
