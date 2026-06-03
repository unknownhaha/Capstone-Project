"use client";

import { useState } from "react";
import styles from "../allproject.module.css";
import sectionStyles from "./section.module.css";
import SectionPicker from "./SectionPicker";
import { getAllSelectableGroupIds } from "@/lib/standards/catalog";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onAdded?: () => void;
};

export default function AddCriteriaModal({ open, onClose, projectId, onAdded }: Props) {
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

  const selectAllGroups = () => {
    setSelectedGroupIds(new Set(getAllSelectableGroupIds()));
  };

  const clearAllGroups = () => {
    setSelectedGroupIds(new Set());
  };

  const handleSubmit = async () => {
    setError(null);
    if (selectedGroupIds.size === 0) {
      setError("Select at least one criteria group.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/add-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ criteriaGroupIds: Array.from(selectedGroupIds) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add criteria");
        return;
      }

      onClose();
      onAdded?.();
    } catch (err) {
      setError("Failed to add criteria. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.createBoxFull} ${open ? styles.showCreateFull : ""}`}>
        <div className={styles.createHeader}>
          <h3>Add Criteria Groups</h3>
          <button type="button" className={styles.createClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.createBody}>
          {error && <p className={sectionStyles.errorText}>{error}</p>}

          <p className={styles.createSectionLabel}>Select additional groups to add</p>

          <p className={sectionStyles.sectionCount}>Selected: {selectedGroupIds.size} criteria groups</p>

          <div className={styles.createCriteriaScroll}>
            <SectionPicker
              mode="select"
              selectedGroupIds={selectedGroupIds}
              onToggleGroup={toggleGroup}
              onSelectAll={selectAllGroups}
              onClearAll={clearAllGroups}
              variant="create"
            />
          </div>
        </div>

        <div className={styles.createFooter}>
          <button className={styles.submit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Adding..." : "Add Criteria"}
          </button>
        </div>
      </div>
    </>
  );
}
