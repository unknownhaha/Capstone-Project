/** Profile page UX copy (English UI chrome on this screen). */

export const profileCopy = {
  loading: "Loading profile...",
  editProfile: "Edit profile",
  saveChanges: "Save changes",
  discardChanges: "Discard changes",
  lockedEditPrompt: "Tap Edit profile first.",
  emailInvalid:
    "Enter an email with @ and a domain. Example: name@example.com",
  saveFailed:
    "We could not save your profile. Check your connection and try again.",
  saveSuccess: "Profile saved.",
  contactSection: "Contact",
  organizationSection: "Organization",
  fields: {
    email: "Email",
    phone: "Phone",
    address: "Address",
    jobTitle: "Job title",
    workplace: "Workplace name",
    department: "Department / team",
    workLocation: "Work location",
  },
  placeholders: {
    email: "name@example.com",
    phone: "0812345678",
    address: "Street, district, province",
    jobTitle: "Inspector, architect, …",
    workplace: "Agency or company name",
    department: "Team or unit",
    workLocation: "Site or office address",
  },
} as const;
