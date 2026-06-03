import skeletonStyles from "./project-card-skeleton.module.css";
import layoutStyles from "./form-skeleton.module.css";
import itemStyles from "./items.module.css";
import styles from "../allproject.module.css";

const ITEM_PLACEHOLDERS = 3;

function Block({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`${skeletonStyles.shimmer} ${layoutStyles.block} ${className ?? ""}`}
      style={style}
    />
  );
}

export default function CriteriaItemsSkeleton() {
  return (
    <div
      className={`${styles.pageLoadingBody} ${itemStyles.pageLoadingWrap}`}
      aria-hidden
    >
      <div className={itemStyles.page}>
        <div className={itemStyles.contentPanel}>
          <div className={itemStyles.contentPanelInner}>
            <Block style={{ width: "72px", height: "20px", marginBottom: "16px" }} />
            <Block style={{ width: "75%", height: "22px", marginBottom: "12px" }} />
            <Block style={{ width: "45%", height: "14px", marginBottom: "20px" }} />
            <div className={layoutStyles.body} style={{ gap: "12px" }}>
              {Array.from({ length: ITEM_PLACEHOLDERS }, (_, i) => (
                <Block
                  key={i}
                  style={{ width: "100%", height: "120px", borderRadius: "14px" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
