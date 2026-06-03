import skeletonStyles from "./project-card-skeleton.module.css";
import layoutStyles from "./form-skeleton.module.css";

type CreateProjectFormSkeletonProps = {
  variant?: "full" | "criteriaOnly";
};

function Block({ className }: { className: string }) {
  return (
    <div
      className={`${skeletonStyles.shimmer} ${layoutStyles.block} ${className}`}
    />
  );
}

export default function CreateProjectFormSkeleton({
  variant = "full",
}: CreateProjectFormSkeletonProps) {
  if (variant === "criteriaOnly") {
    return (
      <div className={layoutStyles.body} aria-hidden>
        <Block className={layoutStyles.labelLg} />
        <Block className={layoutStyles.listBlock} />
      </div>
    );
  }

  return (
    <div className={layoutStyles.body} aria-hidden>
      <Block className={layoutStyles.label} />
      <Block className={layoutStyles.input} />

      <Block className={layoutStyles.labelMd} />
      <Block className={layoutStyles.input} />

      <Block className={layoutStyles.labelSm} />
      <Block className={layoutStyles.textarea} />

      <Block className={layoutStyles.labelLg} />
      <Block className={layoutStyles.listBlock} />
    </div>
  );
}
