"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./sidebar.module.css";

type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
};

type SidebarUser = {
  firstName: string;
  lastName: string;
  profileImg: string;
  email: string;
};

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open || !session?.user?.id) return;

    const loadUser = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        setUser({
          firstName: data.user.firstName ?? "",
          lastName: data.user.lastName ?? "",
          profileImg: data.user.profileImg ?? "",
          email: data.user.contact?.email ?? session.user.email ?? "",
        });
      } catch {
        setUser({
          firstName: session.user.name?.split(" ")[0] ?? "",
          lastName: session.user.name?.split(" ").slice(1).join(" ") ?? "",
          profileImg: session.user.image ?? "",
          email: session.user.email ?? "",
        });
      }
    };

    loadUser();
  }, [open, session]);

  const handleLogout = async () => {
    setLoggingOut(true);
    onClose();
    await signOut({ callbackUrl: "/login" });
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : session?.user?.name ?? "User";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const profileImg = user?.profileImg || session?.user?.image;

  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden />
      <aside
        className={`${styles.sidebar} ${styles.sidebarOpen}`}
        aria-label="Navigation menu"
      >
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Menu</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className={styles.profileBlock}>
          {profileImg ? (
            <img
              src={profileImg}
              alt={displayName}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
          <p className={styles.userName}>{displayName}</p>
          <p className={styles.userEmail}>
            {user?.email ?? session?.user?.email}
          </p>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/allproject"
            className={`${styles.navLink} ${
              pathname === "/allproject" || pathname === "/"
                ? styles.navLinkActive
                : ""
            }`}
            onClick={onClose}
          >
            My Projects
          </Link>
          <Link
            href="/profile"
            className={`${styles.navLink} ${
              pathname.startsWith("/profile") ? styles.navLinkActive : ""
            }`}
            onClick={onClose}
          >
            Profile
          </Link>
        </nav>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>
    </>
  );
}
