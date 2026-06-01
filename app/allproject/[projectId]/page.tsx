"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "../allproject.module.css";
import PhoneShell from "../_components/PhoneShell";
import SectionPicker from "../_components/SectionPicker";
import AddCriteriaModal from "../_components/AddCriteriaModal";
import { useRequireAuth } from "../_components/useRequireAuth";
import {
  buildSectionViews,
  type ApiProject,
} from "../_components/project-utils";
import { canMarkProjectComplete } from "@/lib/project-complete";

export default function ProjectInspectionPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { status, isAuthenticated } = useRequireAuth();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [doneError, setDoneError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !projectId) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/project/${projectId}`, {
          credentials: "include",
        });
        if (res.ok) {
          setProject(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, projectId]);

  if (status === "loading" || !isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.phone}>
          <p className={styles.projectLoading}>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <PhoneShell title="Project" subtitle="Loading...">
        <p className={styles.projectLoading}>Loading project...</p>
      </PhoneShell>
    );
  }

  if (!project) {
    return (
      <PhoneShell title="Project" subtitle="Not found">
        <Link href="/allproject" style={{ color: "white" }}>
          ← Back to projects
        </Link>
      </PhoneShell>
    );
  }

  const sectionViews = buildSectionViews(project);
  const canEdit =
    project.role === "owner" ||
    project.role === "editor" ||
    project.role === undefined;
  const isCompleted = project.status === "completed";
  const readyToComplete = canMarkProjectComplete(project);

  async function handleMarkDone() {
    if (!project || !readyToComplete || markingDone) return;

    const confirmed = window.confirm(
      `Mark "${project.projectName}" as done? You can still view the inspection report afterward.`
    );
    if (!confirmed) return;

    setDoneError(null);
    setMarkingDone(true);

    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDoneError(data.error ?? "Failed to mark project as done");
        return;
      }

      router.push(`/allproject/${projectId}/report`);
    } catch {
      setDoneError("Failed to mark project as done. Please try again.");
    } finally {
      setMarkingDone(false);
    }
  }

  return (
      <PhoneShell
        title={project.projectName}
        subtitle={project.institution?.address ?? "Inspection Form"}
        showMenu={false}
        headerRight={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {canEdit && (
              <button
                type="button"
                onClick={() => setOpenAdd(true)}
                className={styles.addCriteriaBtn}
                aria-label="Add criteria"
              >
                <span className={styles.addCriteriaIcon}>＋</span>
                <span className={styles.addCriteriaBadge}>
                  {Math.round(project.totalCriteria ?? 0)}
                </span>
                <span className={styles.addCriteriaTooltip}>Add new criteria</span>
              </button>
            )}
            <Link href="/allproject" className={styles.closeProjectLink} aria-label="Close project">
              ✕
            </Link>
          </div>
        }
      >
      <div className={styles.projectScroll}>
        <p className={styles.projectProgressLabel}>
          {isCompleted ? "Completed" : "In progress"} ·{" "}
          {Math.round(project.completionRate ?? 0)}%
        </p>

        <div
          style={{
            height: 8,
            background: "#ddd",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: `${project.completionRate ?? 0}%`,
              height: "100%",
              background: "#5f9ea0",
            }}
          />
        </div>

        <SectionPicker
          mode="navigate"
          projectId={projectId}
          sections={sectionViews}
        />

        {doneError && <p className={styles.projectDoneError}>{doneError}</p>}

        {canEdit && !isCompleted && (
          <div className={styles.projectDoneWrap}>
            <p className={styles.projectDoneHint}>
              {readyToComplete
                ? "All checkpoints are scored. Mark this project as done to generate the report."
                : "Score every checkpoint before you can mark this project as done."}
            </p>
            <button
              type="button"
              className={styles.projectDoneBtn}
              disabled={!readyToComplete || markingDone}
              onClick={handleMarkDone}
            >
              {markingDone ? "Marking done..." : "Mark as Done"}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className={styles.projectDoneWrap}>
            <p className={styles.projectDoneHint}>
              This project is marked as done.
            </p>
            <Link
              href={`/allproject/${projectId}/report`}
              className={styles.projectReportBtn}
            >
              View Report
            </Link>
          </div>
        )}

        {canEdit && (
          <>
            <button
              className={styles.fabAdd}
              onClick={() => setOpenAdd(true)}
              aria-label="Add criteria"
            >
              ＋
            </button>
            <div className={styles.fabAddTooltip}>Add new criteria</div>
          </>
        )}
        {canEdit && (
          <AddCriteriaModal
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            projectId={projectId!}
            onAdded={() => {
              setLoading(true);
              (async () => {
                try {
                  const res = await fetch(`/api/project/${projectId}`, {
                    credentials: "include",
                  });
                  if (res.ok) setProject(await res.json());
                } finally {
                  setLoading(false);
                }
              })();
            }}
          />
        )}
      </div>
    </PhoneShell>
  );
}
