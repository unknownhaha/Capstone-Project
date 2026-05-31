"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../allproject.module.css";
import sectionStyles from "./section.module.css";
import SectionPicker from "./SectionPicker";

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!location.trim() || !projectName.trim()) {
      setError("Location and project name are required.");
      return;
    }

    if (selectedGroupIds.size === 0) {
      setError("Select at least one criteria group.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectName,
          location,
          description,
          criteriaGroupIds: Array.from(selectedGroupIds),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && Array.isArray(data.missingFields)) {
          setError(
            data.error ??
              "Complete your profile before creating a project."
          );
          return;
        }
        setError(data.error ?? "Failed to create project");
        return;
      }

      onClose();
      router.push(`/allproject/${data._id}`);
    } catch {
      setError("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div
        className={`${styles.createBoxFull} ${open ? styles.showCreateFull : ""}`}
      >
        <div className={styles.createHeader}>
          <h3>Create Project</h3>
          <button
            type="button"
            className={styles.createClose}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.createBody}>
          {error && <p className={sectionStyles.errorText}>{error}</p>}

          <div className={styles.createFields}>
            <div className={styles.inputGroup}>
              <span>📍</span>
              <input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <input
              className={styles.input}
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <textarea
              className={styles.textarea}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <p className={sectionStyles.sectionCount}>
            Selected: {selectedGroupIds.size} criteria groups
          </p>

          <p className={styles.createSectionLabel}>Sections</p>

          <div className={styles.createCriteriaScroll}>
            <SectionPicker
              mode="select"
              selectedGroupIds={selectedGroupIds}
              onToggleGroup={toggleGroup}
              variant="create"
            />
          </div>
        </div>

        <div className={styles.createFooter}>
          <button
            className={styles.submit}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </>
  );
}
