"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./allproject.module.css";
import PhoneShell from "./_components/PhoneShell";
import CreateProjectModal from "./_components/CreateProjectModal";
import AppSidebar from "./_components/AppSidebar";
import { useRequireAuth } from "./_components/useRequireAuth";
import ProjectCard from "./_components/ProjectCard";
import { type ApiProject } from "./_components/project-utils";
export default function AllProjectPage() {
  const { status, isAuthenticated } = useRequireAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        const res = await fetch("/api/project", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated]);

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

  return (
    <PhoneShell
      title="My Project"
      subtitle="Inspection Dashboard"
      onMenuClick={() => {
        setOpenCreate(false);
        setOpenMenu(true);
      }}
    >
      <AppSidebar open={openMenu} onClose={() => setOpenMenu(false)} />

      {openCreate && (
        <div
          className={styles.overlay}
          onClick={() => setOpenCreate(false)}
        />
      )}

      <div className={styles.top}>
        <div
          className={styles.addBox}
          onClick={() => {
            setOpenMenu(false);
            setOpenCreate(true);
          }}
        >
          +
        </div>
        <Link href="/profile" className={styles.profile} />
      </div>

      <div className={styles.search}>
        <span>🔍</span>
        <input placeholder="Search Project..." />
        <span>⚙️</span>
      </div>

      <div className={styles.grid}>
        {loading && (
          <p style={{ color: "white", gridColumn: "1 / -1", textAlign: "center" }}>
            Loading projects...
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p style={{ color: "white", gridColumn: "1 / -1", textAlign: "center" }}>
            No projects yet. Tap + to create one.
          </p>
        )}

        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onUpdate={(updated) =>
              setProjects((prev) =>
                prev.map((p) =>
                  String(p._id) === String(updated._id)
                    ? { ...p, ...updated, _id: String(updated._id) }
                    : p
                )
              )
            }
            onDelete={(projectId) =>
              setProjects((prev) =>
                prev.filter((p) => String(p._id) !== String(projectId))
              )
            }
          />
        ))}      </div>

      <CreateProjectModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </PhoneShell>
  );
}
