"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./allproject.module.css";
import PhoneShell from "./_components/PhoneShell";
import CreateProjectModal from "./_components/CreateProjectModal";
import ProfileRequiredModal from "./_components/ProfileRequiredModal";
import AppSidebar from "./_components/AppSidebar";
import { useRequireAuth } from "./_components/useRequireAuth";
import { useProfileComplete } from "./_components/useProfileComplete";
import ProjectCard from "./_components/ProjectCard";
import ProjectCardSkeleton from "./_components/ProjectCardSkeleton";
import { filterProjects, type ApiProject } from "./_components/project-utils";
import {
  projectLoadErrorCopy,
  projectLoadErrorFromResponse,
  type ProjectLoadErrorKind,
} from "./_components/project-load-error";

const SKELETON_COUNT = 4;

export default function AllProjectPage() {
  const { status, isAuthenticated } = useRequireAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openProfileRequired, setOpenProfileRequired] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ProjectLoadErrorKind | null>(null);
  const {
    loading: profileLoading,
    complete: profileComplete,
    missingFields,
    refresh: refreshProfile,
  } = useProfileComplete(isAuthenticated);

  const visibleProjects = useMemo(
    () => filterProjects(projects, searchQuery),
    [projects, searchQuery]
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  const doneCount = projects.filter((p) => p.status === "completed").length;
  const activeCount = projects.length - doneCount;
  const progressPercentage =
    projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((sum, p) => sum + Number(p.completionRate ?? 0), 0) /
            projects.length
        );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    let res: Response | null = null;
    try {
      res = await fetch("/api/project", { credentials: "include" });
      if (!res.ok) {
        setLoadError(projectLoadErrorFromResponse(res, false));
        return;
      }
      const data = (await res.json()) as ApiProject[];
      setProjects(data);
    } catch {
      setLoadError(projectLoadErrorFromResponse(res, true));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadProjects();

    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        void loadProjects();
      }
    };

    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [isAuthenticated, loadProjects]);

  const showEmptyState = !loading && loadError === null && projects.length === 0;
  const loadErrorCopy = loadError ? projectLoadErrorCopy(loadError) : null;
  const progressSummaryLabel = loading
    ? "Loading project summary, กำลังโหลดสรุปโครงการ"
    : `Overall completion ${progressPercentage} percent. ${projects.length} total, ${doneCount} done, ${activeCount} active.`;

  function tryOpenCreate() {
    setOpenMenu(false);

    if (profileLoading) return;

    if (!profileComplete) {
      setOpenProfileRequired(true);
      return;
    }

    setOpenCreate(true);
  }

  if (status === "loading" || !isAuthenticated) {
    return (
      <PhoneShell
        title="My Projects"
        titleTh="โครงการของฉัน"
        showMenu={false}
      >
        <p className={styles.srOnly} aria-live="polite">
          Loading... · กำลังโหลด
        </p>
        <section className={styles.projectsSection} aria-label="Project list">
          <div className={styles.listPanel}>
            <div className={styles.grid} aria-busy="true">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell
      title="My Projects"
      titleTh="โครงการของฉัน"
      menuAriaLabel="Open navigation menu, เปิดเมนูนำทาง"
      onMenuClick={() => {
        setOpenCreate(false);
        setOpenMenu(true);
      }}
    >
      <AppSidebar open={openMenu} onClose={() => setOpenMenu(false)} />

      {loadErrorCopy ? (
        <div className={styles.loadError} role="alert">
          <p className={styles.loadErrorTitle}>{loadErrorCopy.titleEn}</p>
          <p className={styles.loadErrorTitleTh} lang="th">
            {loadErrorCopy.titleTh}
          </p>
          {loadErrorCopy.detailEn ? (
            <p className={styles.loadErrorDetail}>{loadErrorCopy.detailEn}</p>
          ) : null}
          <div className={styles.loadErrorActions}>
            <button
              type="button"
              className={styles.loadErrorRetry}
              onClick={() => void loadProjects()}
            >
              Try again · ลองอีกครั้ง
            </button>
            {loadError === "unauthorized" ? (
              <a className={styles.loadErrorLink} href="/login">
                Sign in · เข้าสู่ระบบ
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className={styles.toolbarSection} aria-label="Project actions and summary">
        <div className={styles.top}>
          <button
            type="button"
            className={styles.addBox}
            aria-label="Create project, สร้างโครงการ"
            disabled={profileLoading}
            onClick={tryOpenCreate}
          >
            <span aria-hidden>+</span>
            <span className={styles.addBoxLabel} aria-hidden>
              New
            </span>
          </button>
          <div
            className={styles.progressRing}
            style={{
              background: loading
                ? "conic-gradient(var(--insp-color-ring-loading) 0deg, var(--insp-color-ring-loading) 360deg)"
                : `conic-gradient(var(--insp-color-progress) ${progressPercentage}%, var(--insp-color-ring-track) 0)`,
            }}
            role="group"
            aria-labelledby="dashboard-progress-summary"
          >
            <p
              id="dashboard-progress-summary"
              className={styles.srOnly}
              aria-live="polite"
              aria-atomic="true"
            >
              {progressSummaryLabel}
            </p>
            <div className={styles.profileContent} aria-hidden="true">
              <p className={styles.progressPercent}>
                {loading ? "…" : `${progressPercentage}%`}
              </p>
              <span className={styles.progressLabel}>Completed</span>
              <hr className={styles.profileDivider} />
              <div className={styles.profileStats}>
                <p>
                  <strong>{loading ? "–" : projects.length}</strong>
                  All
                  <span className={styles.statTh} lang="th">
                    ทั้งหมด
                  </span>
                </p>
                <p>
                  <strong>{loading ? "–" : doneCount}</strong>
                  Done
                  <span className={styles.statTh} lang="th">
                    เสร็จ
                  </span>
                </p>
                <p>
                  <strong>{loading ? "–" : activeCount}</strong>
                  Active
                  <span className={styles.statTh} lang="th">
                    ดำเนินอยู่
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.searchSection} aria-label="Search projects">
        <div className={styles.search}>
          <input
            type="search"
            placeholder="Search by name or site · ค้นหาชื่อหรือสถานที่"
            aria-label="Search projects by name or location, ค้นหาโครงการตามชื่อหรือสถานที่"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section
        className={styles.projectsSection}
        aria-labelledby={
          !loading && loadError === null && projects.length > 0
            ? "projects-list-heading"
            : undefined
        }
        aria-label={loading || projects.length === 0 ? "Project list" : undefined}
      >
        <div className={styles.listPanel}>
          {!loading && loadError === null && projects.length > 0 && (
            <div className={styles.listHeader}>
              <h2 id="projects-list-heading" className={styles.sectionHeading}>
                Your inspections · โครงการตรวจ
              </h2>
              {hasSearchQuery ? (
                <p className={styles.listMeta}>
                  {visibleProjects.length} of {projects.length} shown
                </p>
              ) : null}
            </div>
          )}

          <div
            className={`${styles.grid} ${showEmptyState ? styles.gridCentered : ""}`}
            aria-busy={loading}
          >
            {loading && (
              <>
                <p className={styles.srOnly} aria-live="polite">
                  Loading projects... · กำลังโหลดโครงการ
                </p>
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </>
            )}

            {showEmptyState && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrap} aria-hidden="true">
                  <span className={styles.emptyIcon} />
                </div>
                <h2 className={styles.emptyTitle}>No projects yet</h2>
                <p className={styles.emptySubtitle} lang="th">
                  ยังไม่มีโครงการ
                </p>
                <p className={styles.emptySubtitle}>
                  {profileComplete
                    ? "Create your first site inspection."
                    : "Complete your profile to start your first inspection."}
                </p>
                <button
                  type="button"
                  className={styles.startProjectBtn}
                  disabled={profileLoading}
                  onClick={tryOpenCreate}
                >
                  <span className={styles.startProjectBtnIcon} aria-hidden>
                    +
                  </span>
                  {profileComplete
                    ? "Start project · เริ่มโครงการ"
                    : "Complete profile · กรอกโปรไฟล์"}
                </button>
              </div>
            )}

            {!loading &&
              loadError === null &&
              projects.length > 0 &&
              visibleProjects.length === 0 &&
              hasSearchQuery && (
                <p className={styles.gridMessage}>
                  No projects match your search. · ไม่พบโครงการที่ตรงกับการค้นหา
                </p>
              )}

            {!loading &&
              loadError === null &&
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
        </div>
      </section>

      <CreateProjectModal open={openCreate} onClose={() => setOpenCreate(false)} />

      <ProfileRequiredModal
        open={openProfileRequired}
        missingFields={missingFields}
        onClose={() => {
          setOpenProfileRequired(false);
          refreshProfile();
        }}
      />
    </PhoneShell>
  );
}
