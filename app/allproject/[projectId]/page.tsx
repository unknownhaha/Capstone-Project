"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../allproject.module.css";
import PhoneShell from "../_components/PhoneShell";
import SectionPicker from "../_components/SectionPicker";
import AddCriteriaModal from "../_components/AddCriteriaModal";
import { useRequireAuth } from "../_components/useRequireAuth";
import {
  buildSectionViews,
  type ApiProject,
} from "../_components/project-utils";

export default function ProjectInspectionPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { status, isAuthenticated } = useRequireAuth();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

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
          <p style={{ color: "white", textAlign: "center", marginTop: 40 }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <PhoneShell title="Project" subtitle="Loading...">
        <p style={{ color: "white" }}>Loading project...</p>
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

  return (
      <PhoneShell
        title={project.projectName}
        subtitle={project.institution?.address ?? "Inspection Form"}
        showMenu={false}
        headerRight={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setOpenAdd(true)}
              className={styles.addCriteriaBtn}
              aria-label="Add criteria"
            >
              <span className={styles.addCriteriaIcon}>＋</span>
              <span className={styles.addCriteriaBadge}>{Math.round(project.totalCriteria ?? 0)}</span>
              <span className={styles.addCriteriaTooltip}>Add new criteria</span>
            </button>
            <Link href="/allproject" style={{ color: "white", fontSize: 24, marginBottom: 15 }}>
              ✕
            </Link>
          </div>
        }
      >
      <div className={styles.projectScroll}>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "#555",
          }}
        >
          Progress {Math.round(project.completionRate ?? 0)}%
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
        <button className={styles.fabAdd} onClick={() => setOpenAdd(true)} aria-label="Add criteria">＋</button>
        <div className={styles.fabAddTooltip}>Add new criteria</div>
        <AddCriteriaModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          projectId={projectId!}
          onAdded={() => {
            // reload project
            setLoading(true);
            (async () => {
              try {
                const res = await fetch(`/api/project/${projectId}`, { credentials: "include" });
                if (res.ok) setProject(await res.json());
              } finally {
                setLoading(false);
              }
            })();
          }}
        />
      </div>
    </PhoneShell>
  );
}
