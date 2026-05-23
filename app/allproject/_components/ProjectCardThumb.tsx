"use client";

import {
  getProjectCoverImage,
  getProjectInitials,
  type ApiProject,
} from "./project-utils";
import styles from "./project-card-thumb.module.css";

type ProjectCardThumbProps = {
  project: ApiProject;
};

export default function ProjectCardThumb({ project }: ProjectCardThumbProps) {
  const coverImage = getProjectCoverImage(project);

  if (coverImage) {
    return (
      <div className={styles.thumb}>
        <img
          src={coverImage}
          alt=""
          className={styles.thumbImage}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const initials = getProjectInitials(project.projectName);

  return (
    <div className={`${styles.thumb} ${styles.thumbInitials}`}>
      <span className={styles.initialsText}>{initials}</span>
    </div>
  );
}
