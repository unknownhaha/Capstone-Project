"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./allproject.module.css";
import PhoneShell from "./_components/PhoneShell";
import CreateProjectModal from "./_components/CreateProjectModal";
import { useRequireAuth } from "./_components/useRequireAuth";
import type { ApiProject } from "./_components/project-utils";

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
    <PhoneShell title="My Project" subtitle="Inspection Dashboard" onMenuClick={() => setOpenMenu(true)}>
      {(openMenu || openCreate) && (
        <div
          className={styles.overlay}
          onClick={() => {
            setOpenMenu(false);
            setOpenCreate(false);
          }}
        />
      )}

      <div className={`${styles.sidebar} ${openMenu ? styles.showSidebar : ""}`}>
        <h3>Menu</h3>
        <Link href="/profile" className={styles.menuItem}>
          Profile
        </Link>
        <div className={styles.menuItem}>Reports</div>
        <div className={styles.menuItem}>Settings</div>
      </div>

      <div className={styles.top}>
        <div className={styles.addBox} onClick={() => setOpenCreate(true)}>
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

        {projects.map((project) => {
          const totalItems = project.sections.reduce(
            (sum, s) => sum + s.criteria.length,
            0
          );

          return (
            <Link
              key={project._id}
              href={`/allproject/${project._id}`}
              className={styles.card}
            >
              <div className={styles.thumb} />
              <div className={styles.cardInfo}>
                <h4>{project.projectName}</h4>
                <span>{totalItems} Checkpoints</span>
              </div>
              <div className={styles.status}>
                {Math.round(project.completionRate ?? 0)}% Done
              </div>
            </Link>
          );
        })}
      </div>

      <CreateProjectModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </PhoneShell>
  );
}
