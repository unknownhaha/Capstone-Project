import { getProjectRole } from "@/lib/project-access";

type ProjectDoc = {
  toObject?: () => Record<string, unknown>;
  _id?: { toString(): string };
  userId?: unknown;
  collaborationEnabled?: boolean;
  members?: unknown[];
};

function getPopulatedOwnerFirstName(userId: unknown): string | undefined {
  if (!userId || typeof userId !== "object") return undefined;

  const firstName = (userId as { firstName?: unknown }).firstName;
  if (typeof firstName !== "string") return undefined;

  const trimmed = firstName.trim();
  return trimmed || undefined;
}

export function serializeProjectForUser(
  project: ProjectDoc,
  userId: string
): Record<string, unknown> {
  const raw =
    typeof project.toObject === "function" ? project.toObject() : { ...project };

  const role = getProjectRole(
    {
      userId: raw.userId as { toString(): string },
      members: raw.members as { userId: { toString(): string } }[] | undefined,
    },
    userId
  );

  const ownerFirstName =
    role === "editor" ? getPopulatedOwnerFirstName(raw.userId) : undefined;

  return {
    ...raw,
    _id: String(raw._id ?? ""),
    role,
    status: raw.status === "completed" ? "completed" : "draft",
    collaborationEnabled: Boolean(raw.collaborationEnabled),
    ...(ownerFirstName ? { ownerFirstName } : {}),
  };
}
