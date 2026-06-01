"use client";

import { useEffect, useRef, useState } from "react";
import { useFixedMenuPosition } from "./useFixedMenuPosition";
import { useRouter } from "next/navigation";
import ProjectCardThumb from "./ProjectCardThumb";
import { useUploadThing } from "./inspection-upload";
import { type ApiProject } from "./project-utils";
import ShareProjectDialog from "./ShareProjectDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import styles from "./project-card.module.css";

type ProjectCardProps = {
  project: ApiProject;
  onUpdate: (project: ApiProject) => void;
  onDelete: (projectId: string) => void;
};

function pickUploadUrl(
  file: { ufsUrl?: string | null; url?: string | null; appUrl?: string | null } | undefined
): string | null {
  if (!file) return null;
  return file.ufsUrl ?? file.url ?? file.appUrl ?? null;
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isOwner = project.role !== "editor";
  const [coverImg, setCoverImg] = useState(project.coverImg ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const menuStyle = useFixedMenuPosition(menuOpen, kebabRef);
  const { startUpload, isUploading } = useUploadThing("projectCoverImg");

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
      const url = pickUploadUrl(uploaded?.[0]);
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
    } catch {
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
      {isOwner && (
      <div className={styles.cardToolbar}>
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

          {menuOpen && (
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
                {isOwner && (
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
                )}
                {isOwner && (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    disabled={cardBusy}
                    onClick={openCoverPicker}
                  >
                    {isUploading ? "Uploading..." : "Upload cover photo"}
                  </button>
                )}
                {isOwner && (
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    role="menuitem"
                    disabled={cardBusy}
                    onClick={requestDelete}
                  >
                    Delete project
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}

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
        <ProjectCardThumb project={displayProject} />
        <div className={styles.cardInfo}>
          <h4>{project.projectName}</h4>
          <span>{totalItems} Checkpoints</span>
          {!isOwner && (
            <span className={styles.sharedBadge}>Shared with you</span>
          )}
        </div>
        <div className={styles.status}>
          {Math.round(project.completionRate ?? 0)}% Done
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
    </div>
  );
}
