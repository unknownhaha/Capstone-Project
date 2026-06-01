type ProjectCompletionLike = {
  completionRate?: number;
  status?: string;
};

export function isProjectMarkedComplete(project: ProjectCompletionLike): boolean {
  return project.status === "completed";
}

export function canMarkProjectComplete(project: ProjectCompletionLike): boolean {
  if (isProjectMarkedComplete(project)) return false;
  return Math.round(project.completionRate ?? 0) >= 100;
}

export function getIncompleteCompletionMessage(): string {
  return "Score all checkpoints before marking this project as done.";
}
