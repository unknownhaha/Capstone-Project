"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../allproject.module.css";
import sectionStyles from "./section.module.css";
import SectionPicker from "./SectionPicker";
import { useModalA11y } from "./useModalA11y";

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [location, setLocation] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useModalA11y(open, onClose, dialogRef);

  useEffect(() => {
    if (open) return;
    setLocation("");
    setProjectName("");
    setDescription("");
    setSelectedGroupIds(new Set());
    setError(null);
    setSubmitting(false);
  }, [open]);

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
      setError("Location and project name are required. · กรอกสถานที่และชื่อโครงการ");
      return;
    }

    if (selectedGroupIds.size === 0) {
      setError("Select at least one criteria group. · เลือกกลุ่มเกณฑ์อย่างน้อย 1 กลุ่ม");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectName: projectName.trim(),
          location: location.trim(),
          description: description.trim(),
          criteriaGroupIds: Array.from(selectedGroupIds),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : res.status >= 500
              ? "Server error. Try again. · เซิร์ฟเวอร์ขัดข้อง ลองอีกครั้ง"
              : "Failed to create project. · สร้างโครงการไม่สำเร็จ";
        setError(message);
        return;
      }

      onClose();
      router.push(`/allproject/${data._id}`);
    } catch {
      setError("Network error. Check your connection. · เครือข่ายขัดข้อง ลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className={styles.overlayBackdrop}
        aria-label="Close create project dialog, ปิดหน้าต่างสร้างโครงการ"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={`${styles.createBoxFull} ${styles.showCreateFull}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.createHeader}>
          <h3 id={titleId}>Create project · สร้างโครงการ</h3>
          <button
            type="button"
            className={styles.createClose}
            onClick={onClose}
            aria-label="Close create project dialog, ปิด"
          >
            ✕
          </button>
        </div>

        <div className={styles.createBody}>
          {error && (
            <p className={sectionStyles.errorText} role="alert">
              {error}
            </p>
          )}

          <div className={styles.createFields}>
            <label className={styles.fieldLabel} htmlFor="create-location">
              Location · สถานที่
            </label>
            <div className={styles.inputGroup}>
              <span aria-hidden>📍</span>
              <input
                id="create-location"
                name="location"
                placeholder="Building or site name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={200}
                required
                autoComplete="off"
              />
            </div>

            <label className={styles.fieldLabel} htmlFor="create-project-name">
              Project name · ชื่อโครงการ
            </label>
            <input
              id="create-project-name"
              name="projectName"
              className={styles.input}
              placeholder="e.g. Main dormitory inspection"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              maxLength={120}
              required
            />

            <label className={styles.fieldLabel} htmlFor="create-description">
              Description (optional) · คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              id="create-description"
              name="description"
              className={styles.textarea}
              placeholder="Notes for your team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </div>

          <p className={sectionStyles.sectionCount}>
            Selected: {selectedGroupIds.size} criteria groups
          </p>

          <p className={styles.createSectionLabel}>Sections · หมวดเกณฑ์</p>

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
            type="button"
            className={styles.submit}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating... · กำลังสร้าง" : "Create project · สร้างโครงการ"}
          </button>
        </div>
      </div>
    </>
  );
}
