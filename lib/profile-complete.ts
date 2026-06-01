export type ProfileLike = {
  firstName?: string;
  lastName?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  organization?: {
    jobTitle?: string;
    department?: string;
    workPlace?: string;
    workAddress?: string;
  };
};

function trimmed(value?: string): string {
  return (value ?? "").trim();
}

export function getMissingProfileFields(user: ProfileLike): string[] {
  const missing: string[] = [];

  if (!trimmed(user.firstName)) missing.push("First name");
  if (!trimmed(user.lastName)) missing.push("Last name");
  if (!trimmed(user.contact?.phone)) missing.push("Phone");
  if (!trimmed(user.contact?.address)) missing.push("Address");
  if (!trimmed(user.organization?.jobTitle)) missing.push("Job title");
  if (!trimmed(user.organization?.workPlace)) {
    missing.push("Organization / Workplace");
  }
  if (!trimmed(user.organization?.department)) missing.push("Department / Team");
  if (!trimmed(user.organization?.workAddress)) missing.push("Work location");

  return missing;
}

export function isProfileComplete(user: ProfileLike): boolean {
  return getMissingProfileFields(user).length === 0;
}
