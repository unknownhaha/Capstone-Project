import crypto from "crypto";
import ProjectInvite from "@/lib/model/project-invite";

const INVITE_TTL_DAYS = 7;

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function inviteExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);
  return expiresAt;
}

export async function createProjectInvite(projectId: string, createdBy: string) {
  return ProjectInvite.create({
    projectId,
    token: generateInviteToken(),
    createdBy,
    expiresAt: inviteExpiresAt(),
  });
}

export async function revokeProjectInvites(projectId: string) {
  await ProjectInvite.deleteMany({ projectId });
}

export async function getOrCreateInvite(projectId: string, createdBy: string) {
  const existing = await ProjectInvite.findOne({
    projectId,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (existing) return existing;

  return createProjectInvite(projectId, createdBy);
}

/** Invalidate all invite links and issue a fresh token (owner only). */
export async function rotateProjectInvite(projectId: string, createdBy: string) {
  await revokeProjectInvites(projectId);
  return createProjectInvite(projectId, createdBy);
}
