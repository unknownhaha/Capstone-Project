"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCardThumb from "./ProjectCardThumb";
import { useUploadThing } from "./inspection-upload";
import { type ApiProject } from "./project-utils";
import ShareProjectDialog from "./ShareProjectDialog";
import styles from "./project-card.module.css";

type ProjectCardProps = {
  project: ApiProject;
  onUpdate: (project: ApiProject) => void;
  onDelete: (projectId: string) => void;
};

function formatSharedLabel(ownerFirstName?: string): string {
  const name = ownerFirstName?.trim();
  if (name) return `${name} shared with you`;
  return "Shared with you";
}

function pickUploadUrl(file: any): string | null {
  if (!file) return null;
  // Check all possible locations depending on UploadThing version
  return file.ufsUrl ?? file.url ?? file.appUrl ?? file.fileUrl ?? file.serverData?.url ?? file.serverData?.ufsUrl ?? null;
}

export default function ProjectCard({
  project,
  onUpdate,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isOwner = project.role !== "editor";
  const [coverImg, setCoverImg] = useState(project.coverImg ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("projectCoverImg", {
    onUploadError: (error) => {
      console.error("UploadThing Error:", error);
      // Alert the exact reason (e.g., "File size exceeds limit", "Unauthorized")
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
        // The onUploadError callback will have already alerted the user.
        // We throw a silent error here to stop execution gracefully without a double alert.
        throw new Error("SILENT_ABORT");
      }
      
      const url = pickUploadUrl(uploaded[0]);
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
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    setMenuOpen(false);

    const confirmed = window.confirm(
      `Delete "${project.projectName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(true);

    try {
      const res = await fetch(`/api/project/${project._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      onDelete(String(project._id));
    } catch (err) {
      console.error("Delete failed:", err);
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
      <div className={styles.cardToolbar}>
        {isOwner ? (
          <div className={styles.menuWrap}>
            <button
              type="button"
              className={styles.kebabBtn}
              aria-label="Project options"
              aria-expanded={menuOpen}
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
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className={styles.cardMenu} role="menu">
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
                    onClick={handleDelete}
                  >
                    Delete project
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <span className={styles.sharedBadge}>
            {formatSharedLabel(project.ownerFirstName)}
          </span>
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
        <ProjectCardThumb project={displayProject} />
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
    </div>
  );
}
