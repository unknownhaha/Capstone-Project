export type ProjectPatchBody = Record<string, unknown>;

export type ProjectPatchValidationError = {
  status: number;
  error: string;
};

export function validateProjectPatchBody(
  body: ProjectPatchBody
): ProjectPatchValidationError | null {
  if (body.sections !== undefined) {
    return {
      status: 400,
      error:
        "Cannot replace sections via project PATCH. Use criterion PATCH or POST .../add-groups.",
    };
  }

  if (body.projectName !== undefined && !String(body.projectName).trim()) {
    return { status: 400, error: "projectName cannot be empty" };
  }

  if (
    body.status !== undefined &&
    !["draft", "completed"].includes(String(body.status))
  ) {
    return { status: 400, error: "Invalid status" };
  }

  if (
    body.buildingType !== undefined &&
    !["single_floor", "multi_floor"].includes(String(body.buildingType))
  ) {
    return { status: 400, error: "Invalid buildingType" };
  }

  if (
    body.institution !== undefined &&
    (typeof body.institution !== "object" || body.institution === null)
  ) {
    return { status: 400, error: "Invalid institution" };
  }

  return null;
}
