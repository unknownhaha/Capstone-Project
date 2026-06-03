"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnchoredMenuPosition } from "./useAnchoredMenuPosition";
import { useRouter } from "next/navigation";
import ProjectCardThumb from "./ProjectCardThumb";
import { useUploadThing } from "./inspection-upload";
import { type ApiProject } from "./project-utils";
import ShareProjectDialog from "./ShareProjectDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import LeaveConfirmDialog from "./LeaveConfirmDialog";
import { pickUploadFileUrl } from "@/lib/upload-file-url";
import styles from "./project-card.module.css";

type ProjectCardProps = {
  project: ApiProject;
  onUpdate: (project: ApiProject) => void;
  onDelete: (projectId: string) => void;
  /** Drops a shared project from the dashboard (leaves collaboration; does not delete). */
  onRemove?: (projectId: string) => void;
};

function formatSharedLabel(ownerFirstName?: string): string {
  const name = ownerFirstName?.trim();
  if (name) return `${name} shared with you`;
  return "Shared with you";
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
  onRemove,
}: ProjectCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isOwner = project.role !== "editor";
  const [coverImg, setCoverImg] = useState(project.coverImg ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const menuStyle = useAnchoredMenuPosition(menuOpen, kebabRef);
  const { startUpload, isUploading } = useUploadThing("projectCoverImg", {
    onUploadError: (error) => {
      console.error("UploadThing Error:", error);
      alert(`Upload failed: ${error.message}`);
    },
  });

  useEffect(() => {
    setCoverImg(project.coverImg ?? "");
  }, [project.coverImg, project._id]);

  const displayProject: ApiProject = { ...project, coverImg: coverImg || undefined };

  const totalItems = project.sections.reduce(
    (sum, section) => sum + section.criteria.length,
    0
  );

  async function handleCoverSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMenuOpen(false);
    setBusy(true);

    const previousCover = coverImg;

    try {
      const uploaded = await startUpload([file]);

      if (!uploaded || uploaded.length === 0) {
        throw new Error("SILENT_ABORT");
      }

      const url = pickUploadFileUrl(uploaded[0]);
      if (!url) throw new Error("No upload URL returned");

      setCoverImg(url);

      const res = await fetch(`/api/project/${project._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImg: url }),
      });

      if (!res.ok) throw new Error("Failed to save cover");

      const updated = (await res.json()) as ApiProject;
      const savedCover = updated.coverImg ?? url;

      setCoverImg(savedCover);
      onUpdate({
        ...project,
        ...updated,
        _id: String(updated._id ?? project._id),
        coverImg: savedCover,
      });
    } catch (err) {
      if (err instanceof Error && err.message !== "SILENT_ABORT") {
        console.error("Cover upload exception:", err);
        alert(err.message);
      }
      setCoverImg(previousCover);
      setActionError("Could not update cover. Try again. · อัปเดตภาพปกไม่สำเร็จ");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function requestDelete() {
    setMenuOpen(false);
    setDeleteOpen(true);
  }

  async function confirmLeave() {
    setBusy(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/project/${project._id}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setActionError(
          res.status >= 500
            ? "Server error. Try again. · เซิร์ฟเวอร์ขัดข้อง"
            : "Could not remove project from your list. · เอาออกจากรายการไม่สำเร็จ"
        );
        return;
      }

      setLeaveOpen(false);
      (onRemove ?? onDelete)(String(project._id));
    } catch {
      setActionError("Network error. Try again. · เครือข่ายขัดข้อง");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/project/${project._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        setActionError(
          res.status >= 500
            ? "Server error. Try again. · เซิร์ฟเวอร์ขัดข้อง"
            : "Could not delete project. · ลบโครงการไม่สำเร็จ"
        );
        return;
      }

      setDeleteOpen(false);
      onDelete(String(project._id));
    } catch {
      setActionError("Network error. Try again. · เครือข่ายขัดข้อง");
    } finally {
      setBusy(false);
    }
  }

  function openCoverPicker() {
    setMenuOpen(false);
    fileInputRef.current?.click();
  }

  const cardBusy = busy || isUploading;

  return (
    <div className={`${styles.card} ${cardBusy ? styles.cardBusy : ""}`}>
      {actionError && (
        <p className={styles.cardActionError} role="alert">
          {actionError}
        </p>
      )}
      <div className={styles.cardToolbar}>
        {isOwner ? (
          <div className={styles.menuWrap}>
            <button
              ref={kebabRef}
              type="button"
              className={styles.kebabBtn}
              aria-label="Project options, ตัวเลือกโครงการ"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              disabled={cardBusy}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
            >
              ⋮
            </button>

            {menuOpen &&
              createPortal(
                <>
                  <button
                    type="button"
                    className={styles.menuBackdrop}
                    aria-label="Close menu, ปิดเมนู"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className={styles.cardMenu}
                    role="menu"
                    style={menuStyle}
                  >
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      disabled={cardBusy}
                      onClick={() => {
                        setMenuOpen(false);
                        setShareOpen(true);
                      }}
                    >
                      Share project
                    </button>
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      disabled={cardBusy}
                      onClick={openCoverPicker}
                    >
                      {isUploading ? "Uploading..." : "Upload cover photo"}
                    </button>
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                      disabled={cardBusy}
                      onClick={requestDelete}
                    >
                      Delete project
                    </button>
                  </div>
                </>,
                document.body
              )}
          </div>
        ) : (
          <button
            type="button"
            className={styles.removeBtn}
            aria-label={`Remove ${project.projectName} from your list, เอาโครงการออกจากรายการ`}
            disabled={cardBusy}
            onClick={(e) => {
              e.stopPropagation();
              setLeaveOpen(true);
            }}
          >
            <span className={styles.removeBtnIcon} aria-hidden="true">
              ×
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        disabled={cardBusy}
        onChange={handleCoverSelected}
      />

      <button
        type="button"
        className={styles.cardLink}
        disabled={cardBusy}
        onClick={() => router.push(`/allproject/${project._id}`)}
      >
        <div className={styles.thumbSlot}>
          <ProjectCardThumb project={displayProject} />
          {!isOwner ? (
            <span className={styles.sharedBadge}>
              {formatSharedLabel(project.ownerFirstName)}
            </span>
          ) : null}
        </div>
        <div className={styles.cardInfo}>
          <h4>{project.projectName}</h4>
          <span>{totalItems} Checkpoints</span>
        </div>
        <div
          className={`${styles.status} ${
            project.status === "completed" ? styles.statusDone : ""
          }`}
        >
          {project.status === "completed"
            ? "Completed"
            : `${Math.round(project.completionRate ?? 0)}% progress`}
        </div>
      </button>

      <ShareProjectDialog
        open={shareOpen}
        projectId={String(project._id)}
        collaborationEnabled={Boolean(project.collaborationEnabled)}
        onClose={() => setShareOpen(false)}
        onCollaborationChange={(collaborationEnabled) => {
          onUpdate({
            ...project,
            collaborationEnabled,
          });
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        projectName={project.projectName}
        busy={busy}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />

      <LeaveConfirmDialog
        open={leaveOpen}
        projectName={project.projectName}
        busy={busy}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => void confirmLeave()}
      />
    </div>
  );
}
