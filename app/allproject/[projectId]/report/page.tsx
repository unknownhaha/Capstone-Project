"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../allproject.module.css";
import PhoneShell from "../../_components/PhoneShell";
import ProjectReportView from "../../_components/ProjectReportView";
import { useRequireAuth } from "../../_components/useRequireAuth";
import { type ApiProject } from "../../_components/project-utils";

export default function ProjectReportPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { status, isAuthenticated } = useRequireAuth();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);

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
      <PhoneShell title="Report" subtitle="Loading...">
        <p style={{ color: "white" }}>Loading report...</p>
      </PhoneShell>
    );
  }

  if (!project) {
    return (
      <PhoneShell title="Report" subtitle="Not found">
        <Link href="/allproject" style={{ color: "white" }}>
          ← Back to projects
        </Link>
      </PhoneShell>
    );
  }

  if (project.status !== "completed") {
    return (
      <PhoneShell
        title={project.projectName}
        subtitle="Report unavailable"
        showMenu={false}
        headerRight={
          <Link href={`/allproject/${projectId}`} style={{ color: "white", fontSize: 24, marginBottom: 15 }}>
            ✕
          </Link>
        }
      >
        <div className={styles.reportUnavailable}>
          <p>This report is available after you mark the project as done.</p>
          <Link href={`/allproject/${projectId}`} className={styles.reportPrimaryBtn}>
            Go to project
          </Link>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell
      title="Report"
      subtitle={project.projectName}
      scrollable
      showMenu={false}
      headerRight={
        <Link href="/allproject" style={{ color: "white", fontSize: 24, marginBottom: 15 }}>
          ✕
        </Link>
      }
    >
      <ProjectReportView project={project} projectId={projectId} />
    </PhoneShell>
  );
}
