"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./project-card.module.css";
import { useModalA11y } from "./useModalA11y";

type ShareProjectDialogProps = {
  open: boolean;
  projectId: string;
  collaborationEnabled: boolean;
  onClose: () => void;
  onCollaborationChange: (enabled: boolean) => void;
};

export default function ShareProjectDialog({
  open,
  projectId,
  collaborationEnabled,
  onClose,
  onCollaborationChange,
}: ShareProjectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(collaborationEnabled);

  useModalA11y(open, onClose, panelRef);

  useEffect(() => {
    setEnabled(collaborationEnabled);
  }, [collaborationEnabled, open]);

  useEffect(() => {
    if (!open) {
      setInviteUrl(null);
      setError(null);
      setCopied(false);
      return;
    }

    if (!enabled) return;

    let cancelled = false;

    async function loadInvite() {
      setBusy(true);
      setError(null);

      try {
        const res = await fetch(`/api/project/${projectId}/invite`, {
          credentials: "include",
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "Could not load invite link. · โหลดลิงก์ไม่สำเร็จ");
          return;
        }

        setInviteUrl(data.inviteUrl ?? null);
      } catch {
        if (!cancelled) {
          setError("Could not load invite link. · โหลดลิงก์ไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    loadInvite();

    return () => {
      cancelled = true;
    };
  }, [open, enabled, projectId]);

  async function postCollaboration(action: "enable" | "disable" | "rotate_invite") {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/project/${projectId}/collaboration`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Request failed. · คำขอไม่สำเร็จ");
        return null;
      }

      return data as { collaborationEnabled?: boolean; inviteUrl?: string | null };
    } catch {
      setError("Request failed. · คำขอไม่สำเร็จ");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleEnable() {
    const data = await postCollaboration("enable");
    if (!data) return;

    setEnabled(true);
    setInviteUrl(data.inviteUrl ?? null);
    onCollaborationChange(true);
  }

  async function handleDisable() {
    const data = await postCollaboration("disable");
    if (!data) return;

    setEnabled(false);
    setInviteUrl(null);
    onCollaborationChange(false);
  }

  async function handleRotateInvite() {
    const data = await postCollaboration("rotate_invite");
    if (!data) return;

    setInviteUrl(data.inviteUrl ?? null);
    setCopied(false);
  }

  async function handleCopy() {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link. Select and copy manually. · คัดลอกไม่สำเร็จ");
    }
  }

  if (!open) return null;

  return (
    <div ref={panelRef} className={styles.sharePanel}>
      <button
        type="button"
        className={styles.shareBackdrop}
        aria-label="Close share dialog, ปิดหน้าต่างแชร์"
        onClick={onClose}
      />
      <div
        className={styles.shareDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h3 id={titleId} className={styles.shareTitle}>
          Share project · แชร์โครงการ
        </h3>
        <p className={styles.shareHint}>
          Only people with an account can join using this link.
        </p>
        <p className={styles.shareHintTh} lang="th">
          เฉพาะผู้ที่มีบัญชีเท่านั้นที่เข้าร่วมผ่านลิงก์นี้ได้
        </p>

        {!enabled ? (
          <button
            type="button"
            className={styles.sharePrimaryBtn}
            disabled={busy}
            onClick={handleEnable}
          >
            {busy ? "Enabling... · กำลังเปิด" : "Enable collaboration · เปิดการทำงานร่วมกัน"}
          </button>
        ) : (
          <>
            <label className={styles.shareLabel} htmlFor="invite-url">
              Invite link · ลิงก์เชิญ
            </label>
            <input
              id="invite-url"
              className={styles.shareUrlInput}
              readOnly
              value={inviteUrl ?? (busy ? "Loading..." : "")}
            />
            <button
              type="button"
              className={styles.sharePrimaryBtn}
              disabled={busy || !inviteUrl}
              onClick={handleCopy}
            >
              {copied ? "Copied! · คัดลอกแล้ว" : "Copy link · คัดลอกลิงก์"}
            </button>
            <button
              type="button"
              className={styles.shareSecondaryBtn}
              disabled={busy}
              onClick={handleRotateInvite}
            >
              {busy ? "Working... · กำลังทำงาน" : "Reset invite link · รีเซ็ตลิงก์"}
            </button>
            <button
              type="button"
              className={styles.shareDangerBtn}
              disabled={busy}
              onClick={handleDisable}
            >
              Disable collaboration · ปิดการทำงานร่วมกัน
            </button>
          </>
        )}

        {error && (
          <p className={styles.shareError} role="alert">
            {error}
          </p>
        )}

        <button type="button" className={styles.shareCancelBtn} onClick={onClose}>
          Close · ปิด
        </button>
      </div>
    </div>
  );
}
