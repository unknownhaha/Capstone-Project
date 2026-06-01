import styles from "./project-card-skeleton.module.css";

export default function ProjectCardSkeleton() {
  return (
    <div
      className={styles.skeletonCard}
      aria-hidden
    >
      <div className={`${styles.shimmer} ${styles.skeletonThumb}`} />
      <div className={`${styles.shimmer} ${styles.skeletonLine}`} />
      <div className={`${styles.shimmer} ${styles.skeletonLineShort}`} />
      <div className={`${styles.shimmer} ${styles.skeletonBadge}`} />
    </div>
  );
}
