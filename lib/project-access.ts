type ProjectLike = {
  userId: { toString(): string } | string;
  members?: { userId: { toString(): string } | string; role?: string }[];
  collaborationEnabled?: boolean;
};

function normalizeId(id: unknown): string {
  return String(id);
}

export function isOwner(project: ProjectLike, userId: string): boolean {
  return normalizeId(project.userId) === userId;
}

export function isMember(project: ProjectLike, userId: string): boolean {
  if (!project.members?.length) return false;
  return project.members.some((m) => normalizeId(m.userId) === userId);
}

export function getProjectRole(
  project: ProjectLike,
  userId: string
): "owner" | "editor" | null {
  if (isOwner(project, userId)) return "owner";
  if (isMember(project, userId)) return "editor";
  return null;
}

export function canViewProject(project: ProjectLike, userId: string): boolean {
  return getProjectRole(project, userId) !== null;
}

export function canEditProject(project: ProjectLike, userId: string): boolean {
  const role = getProjectRole(project, userId);
  return role === "owner" || role === "editor";
}

export function canShareProject(project: ProjectLike, userId: string): boolean {
  return isOwner(project, userId);
}

export function canDeleteProject(project: ProjectLike, userId: string): boolean {
  return isOwner(project, userId);
}

/** Editor leaves collaboration; project is not deleted. */
export function canLeaveProject(project: ProjectLike, userId: string): boolean {
  return getProjectRole(project, userId) === "editor";
}
