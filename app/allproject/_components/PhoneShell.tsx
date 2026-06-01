"use client";

import styles from "../allproject.module.css";

type PhoneShellProps = {
  title: string;
  titleTh?: string;
  subtitle?: string;
  subtitleTh?: string;
  children: React.ReactNode;
  onMenuClick?: () => void;
  menuAriaLabel?: string;
  showMenu?: boolean;
  headerRight?: React.ReactNode;
  scrollable?: boolean;
};

export default function PhoneShell({
  title,
  titleTh,
  subtitle,
  subtitleTh,
  children,
  onMenuClick,
  menuAriaLabel = "Open navigation menu",
  showMenu = true,
  headerRight,
  scrollable = false,
}: PhoneShellProps) {
  return (
    <div
      className={`${styles.container} ${scrollable ? styles.containerScrollable : ""}`}
    >
      <div className={`${styles.phone} ${scrollable ? styles.phoneScrollable : ""}`}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {titleTh ? (
              <p className={styles.headerTh} lang="th">
                {titleTh}
              </p>
            ) : null}
            {subtitle ? <p className={styles.headerSubtitle}>{subtitle}</p> : null}
            {subtitleTh ? (
              <p className={styles.headerSubtitleTh} lang="th">
                {subtitleTh}
              </p>
            ) : null}
          </div>
          {showMenu && onMenuClick ? (
            <button
              type="button"
              className={styles.menuBtn}
              onClick={onMenuClick}
              aria-label={menuAriaLabel}
            >
              ☰
            </button>
          ) : null}
          {headerRight}
        </div>
        <main className={styles.phoneMain}>{children}</main>
      </div>
    </div>
  );
}
