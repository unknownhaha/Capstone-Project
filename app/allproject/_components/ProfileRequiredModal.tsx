"use client";

import { useRouter } from "next/navigation";
import styles from "../allproject.module.css";

type ProfileRequiredModalProps = {
  open: boolean;
  missingFields: string[];
  onClose: () => void;
};

export default function ProfileRequiredModal({
  open,
  missingFields,
  onClose,
}: ProfileRequiredModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden />
      <div
        className={styles.profileRequiredDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-required-title"
      >
        <h3 id="profile-required-title" className={styles.profileRequiredTitle}>
          Complete your profile first
        </h3>
        <p className={styles.profileRequiredHint}>
          Fill in all profile details before creating a project.
        </p>

        {missingFields.length > 0 && (
          <ul className={styles.profileRequiredList}>
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={styles.profileRequiredPrimaryBtn}
          onClick={() => {
            onClose();
            router.push("/profile");
          }}
        >
          Go to Profile
        </button>
        <button
          type="button"
          className={styles.profileRequiredCancelBtn}
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
