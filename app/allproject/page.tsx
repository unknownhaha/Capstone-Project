"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./allproject.module.css";
import PhoneShell from "./_components/PhoneShell";
import CreateProjectModal from "./_components/CreateProjectModal";
import AppSidebar from "./_components/AppSidebar";
import { useRequireAuth } from "./_components/useRequireAuth";
import ProjectCard from "./_components/ProjectCard";
import { filterProjects, type ApiProject } from "./_components/project-utils";

export default function AllProjectPage() {
  const { status, isAuthenticated } = useRequireAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const visibleProjects = useMemo(
    () => filterProjects(projects, searchQuery),
    [projects, searchQuery]
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  // Calculate average progress across all projects
  const totalProgress = projects.reduce((sum, p) => {
    const completionRate = Number((p as any).completionRate || 0);
    return sum + completionRate;
  }, 0);
  
  const progressPercentage = projects.length === 0 ? 0 : Math.round(totalProgress / projects.length);
  
  // Count Done and Active projects
  const doneCount = projects.filter(p => {
    const completionRate = Number((p as any).completionRate || 0);
    return completionRate >= 100;
  }).length;
  
  const activeCount = projects.length - doneCount;

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
        <Link 
          href="/profile" 
          className={styles.profile}
          style={{ background: `conic-gradient(#57cc99 ${progressPercentage}%, rgba(255, 255, 255, 0.2) 0)` }}
        >
          <div className={styles.profileContent}>
            <h3>{progressPercentage}%</h3>
            <span>Completed</span>
            <hr className={styles.profileDivider} />
            <div className={styles.profileStats}>
              <p><strong>{projects.length}</strong> All</p>
              <p><strong>{doneCount}</strong> Done</p>
              <p><strong>{activeCount}</strong> Active</p>
            </div>
          </div>
        </Link>
      </div>

      <div className={styles.search}>
        <span aria-hidden>🔍</span>
        <input
          type="search"
          placeholder="Search Project..."
          aria-label="Search projects by name or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span aria-hidden>⚙️</span>
      </div>

      <div className={styles.grid}>
        {loading && (
          <p className={styles.gridMessage}>Loading projects...</p>
        )}

        {!loading && projects.length === 0 && (
          <p className={styles.gridMessage}>
            No projects yet. Tap + to create one.
          </p>
        )}

        {!loading &&
          projects.length > 0 &&
          visibleProjects.length === 0 &&
          hasSearchQuery && (
            <p className={styles.gridMessage}>No projects match your search.</p>
          )}

        {!loading &&
          visibleProjects.map((project) => (
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
          ))}
      </div>

      <CreateProjectModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </PhoneShell>
  );
}
