import { getProjectRole } from "@/lib/project-access";

type ProjectDoc = {
  toObject?: () => Record<string, unknown>;
  _id?: { toString(): string };
  userId?: unknown;
  collaborationEnabled?: boolean;
  members?: unknown[];
};

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

  return {
    ...raw,
    _id: String(raw._id ?? ""),
    role,
    collaborationEnabled: Boolean(raw.collaborationEnabled),
  };
}
