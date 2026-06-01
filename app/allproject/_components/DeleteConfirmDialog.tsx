"use client";

import { useId, useRef } from "react";
import styles from "./delete-confirm-dialog.module.css";
import { useModalA11y } from "./useModalA11y";

type DeleteConfirmDialogProps = {
  open: boolean;
  projectName: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteConfirmDialog({
  open,
  projectName,
  busy = false,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useModalA11y(open, onClose, panelRef);

  if (!open) return null;

  return (
    <div ref={panelRef} className={styles.panel}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cancel delete, ยกเลิกการลบ"
        onClick={onClose}
      />
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <h3 id={titleId} className={styles.title}>
          Delete project? · ลบโครงการ?
        </h3>
        <p id={descId} className={styles.body}>
          <span className={styles.projectName}>{projectName}</span> will be removed
          permanently. This cannot be undone.
        </p>
        <p className={styles.bodyTh} lang="th">
          โครงการนี้จะถูกลบถาวร และไม่สามารถกู้คืนได้
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={busy}
          >
            Keep project · เก็บไว้
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Deleting... · กำลังลบ" : "Delete project · ลบโครงการ"}
          </button>
        </div>
      </div>
    </div>
  );
}
