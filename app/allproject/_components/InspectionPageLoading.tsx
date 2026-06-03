import PhoneShell from "./PhoneShell";
import styles from "../allproject.module.css";

type InspectionPageLoadingProps = {
  title: string;
  liveMessage: string;
  children: React.ReactNode;
};

/** Full-page loading shell: shimmer content only (no visible “Loading…” subtitle). */
export default function InspectionPageLoading({
  title,
  liveMessage,
  children,
}: InspectionPageLoadingProps) {
  return (
    <PhoneShell title={title} showMenu={false}>
      <p className={styles.srOnly} aria-live="polite">
        {liveMessage}
      </p>
      {children}
    </PhoneShell>
  );
}
