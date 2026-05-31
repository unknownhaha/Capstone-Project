"use client";

import { useEffect, useState } from "react";
import styles from "./project-card.module.css";

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
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(collaborationEnabled);

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
          setError(data.error ?? "Could not load invite link");
          return;
        }

        setInviteUrl(data.inviteUrl ?? null);
      } catch {
        if (!cancelled) setError("Could not load invite link");
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
        setError(data.error ?? "Request failed");
        return null;
      }

      return data as { collaborationEnabled?: boolean; inviteUrl?: string | null };
    } catch {
      setError("Request failed");
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
      setError("Could not copy link. Select and copy manually.");
    }
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className={styles.shareBackdrop}
        aria-label="Close share dialog"
        onClick={onClose}
      />
      <div
        className={styles.shareDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <h3 id="share-title" className={styles.shareTitle}>
          Share project
        </h3>
        <p className={styles.shareHint}>
          Only people with an account can join using this link. You control who gets access.
        </p>

        {!enabled ? (
          <button
            type="button"
            className={styles.sharePrimaryBtn}
            disabled={busy}
            onClick={handleEnable}
          >
            {busy ? "Enabling…" : "Enable collaboration"}
          </button>
        ) : (
          <>
            <label className={styles.shareLabel} htmlFor="invite-url">
              Invite link
            </label>
            <input
              id="invite-url"
              className={styles.shareUrlInput}
              readOnly
              value={inviteUrl ?? (busy ? "Loading…" : "")}
            />
            <button
              type="button"
              className={styles.sharePrimaryBtn}
              disabled={busy || !inviteUrl}
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              type="button"
              className={styles.shareSecondaryBtn}
              disabled={busy}
              onClick={handleRotateInvite}
            >
              {busy ? "Working…" : "Reset invite link"}
            </button>
            <button
              type="button"
              className={styles.shareDangerBtn}
              disabled={busy}
              onClick={handleDisable}
            >
              Disable collaboration
            </button>
          </>
        )}

        {error && <p className={styles.shareError}>{error}</p>}

        <button type="button" className={styles.shareCancelBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
