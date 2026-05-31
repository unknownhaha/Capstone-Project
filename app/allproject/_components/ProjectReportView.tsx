"use client";

import Link from "next/link";
import styles from "../allproject.module.css";
import {
  getProjectPreviewStats,
  getProjectSectionReports,
  type ApiProject,
} from "./project-utils";

type ProjectReportViewProps = {
  project: ApiProject;
  projectId: string;
};

function formatReportDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectReportView({
  project,
  projectId,
}: ProjectReportViewProps) {
  const stats = getProjectPreviewStats(project);
  const sections = getProjectSectionReports(project);

  return (
    <div className={styles.reportPage}>
      <div className={styles.reportHero}>
        <p className={styles.reportEyebrow}>Inspection Report</p>
        <h2 className={styles.reportTitle}>{project.projectName}</h2>
        <p className={styles.reportMeta}>
          {project.institution?.address ?? "No location"}
        </p>
        <p className={styles.reportMeta}>
          Completed {formatReportDate(project.completedAt)}
        </p>
      </div>

      <div className={styles.reportSummaryGrid}>
        <div className={styles.reportSummaryCard}>
          <span className={styles.reportSummaryLabel}>Overall score</span>
          <strong className={styles.reportSummaryValue}>
            {stats.scorePercent}%
          </strong>
          <span className={styles.reportSummaryHint}>
            {stats.totalScore} / {stats.maxScore} points
          </span>
        </div>
        <div className={styles.reportSummaryCard}>
          <span className={styles.reportSummaryLabel}>Checkpoints</span>
          <strong className={styles.reportSummaryValue}>
            {stats.scoredCount}/{stats.totalItems}
          </strong>
          <span className={styles.reportSummaryHint}>Scored</span>
        </div>
      </div>

      <div className={styles.reportScoreRow}>
        <div className={`${styles.reportScorePill} ${styles.reportScorePass}`}>
          Pass <strong>{stats.scoreCounts.pass}</strong>
        </div>
        <div className={`${styles.reportScorePill} ${styles.reportScorePartial}`}>
          Partial <strong>{stats.scoreCounts.partial}</strong>
        </div>
        <div className={`${styles.reportScorePill} ${styles.reportScoreFail}`}>
          Fail <strong>{stats.scoreCounts.fail}</strong>
        </div>
      </div>

      <h3 className={styles.reportSectionHeading}>Section results</h3>
      <div className={styles.reportSectionList}>
        {sections.map((section) => (
          <article key={section.code} className={styles.reportSectionCard}>
            <div className={styles.reportSectionTop}>
              <div>
                <p className={styles.reportSectionCode}>{section.code}</p>
                <h4 className={styles.reportSectionTitle}>{section.title}</h4>
              </div>
              <div className={styles.reportSectionScore}>
                <strong>{section.scorePercent}%</strong>
                <span>{section.totalScore}/{section.maxScore}</span>
              </div>
            </div>
            <div className={styles.reportSectionStats}>
              <span>{section.scoredCount}/{section.totalItems} scored</span>
              <span>Pass {section.scoreCounts.pass}</span>
              <span>Partial {section.scoreCounts.partial}</span>
              <span>Fail {section.scoreCounts.fail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.reportActions}>
        <Link href={`/allproject/${projectId}`} className={styles.reportSecondaryBtn}>
          Back to project
        </Link>
        <Link href="/allproject" className={styles.reportPrimaryBtn}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
