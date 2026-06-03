"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./leave-confirm-dialog.module.css";
import { useModalA11y } from "./useModalA11y";

type LeaveConfirmDialogProps = {
  open: boolean;
  projectName: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function LeaveConfirmDialog({
  open,
  projectName,
  busy = false,
  onConfirm,
  onClose,
}: LeaveConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModalA11y(open, onClose, panelRef);

  if (!open) return null;

  const dialog = (
    <div ref={panelRef} className={styles.panel}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cancel, ยกเลิก"
        onClick={onClose}
      />
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h3 id={titleId} className={styles.title}>
          Remove from your list?
          <span className={styles.titleTh} lang="th">
            เอาออกจากรายการของคุณ?
          </span>
        </h3>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={busy}
            autoFocus
            aria-label={`Keep ${projectName} on your list, เก็บโครงการไว้`}
          >
            <span className={styles.btnIcon} aria-hidden="true">
              ×
            </span>
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={busy}
            aria-label={`Remove ${projectName} from your list, เอาออกจากรายการ`}
          >
            <span className={styles.btnIcon} aria-hidden="true">
              ✓
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return dialog;
  return createPortal(dialog, document.body);
}
