"use client";

import styles from "../allproject.module.css";

type PhoneShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onMenuClick?: () => void;
  showMenu?: boolean;
  headerRight?: React.ReactNode;
};

export default function PhoneShell({
  title,
  subtitle,
  children,
  onMenuClick,
  showMenu = true,
  headerRight,
}: PhoneShellProps) {
  return (
    <div className={styles.container}>
      <div className={styles.phone}>
        <div className={styles.header}>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {showMenu && (
            <div className={styles.menu} onClick={onMenuClick}>
              ☰
            </div>
          )}
          {headerRight}
        </div>
        {children}
      </div>
    </div>
  );
}
