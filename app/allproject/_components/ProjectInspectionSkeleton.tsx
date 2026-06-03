import skeletonStyles from "./project-card-skeleton.module.css";
import layoutStyles from "./form-skeleton.module.css";
import styles from "../allproject.module.css";

function Block({ className }: { className: string }) {
  return (
    <div
      className={`${skeletonStyles.shimmer} ${layoutStyles.block} ${className}`}
    />
  );
}

export default function ProjectInspectionSkeleton() {
  return (
    <div className={styles.pageLoadingBody} aria-hidden>
      <div className={styles.projectScroll}>
        <Block className={layoutStyles.progressLabel} />
        <Block className={layoutStyles.progressBar} />
        <Block className={layoutStyles.sectionList} />
      </div>
    </div>
  );
}
