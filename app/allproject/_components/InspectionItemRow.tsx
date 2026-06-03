"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/lib/standards/catalog";
import { useUploadThing } from "./inspection-upload";
import styles from "./items.module.css";

type InspectionItemRowProps = {
  item: CatalogItem;
  score: number | null;
  userNote?: string | null;
  inspectionImgs?: string[];
  onScoreChange: (itemId: string, score: number) => void;
  onNoteChange: (itemId: string, note: string) => void;
  onImagesChange: (itemId: string, imgs: string[]) => void;
  saving?: boolean;
  savingNote?: boolean;
  uploading?: boolean;
};

const SCORES = [
  { value: 0, label: "0", className: styles.scoreRed },
  { value: 1, label: "1", className: styles.scoreYellow },
  { value: 2, label: "2", className: styles.scoreGreen },
] as const;

export default function InspectionItemRow({
  item,
  score,
  userNote,
  inspectionImgs = [],
  onScoreChange,
  onNoteChange,
  onImagesChange,
  saving,
  savingNote,
  uploading,
}: InspectionItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [noteDraft, setNoteDraft] = useState(userNote ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("inspectionImg");
  const busy = saving || savingNote || uploading || isUploading;

  useEffect(() => {
    setNoteDraft(userNote ?? "");
  }, [userNote]);

  useEffect(() => {
    if (!previewUrl) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewUrl(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewUrl]);

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const uploaded = await startUpload(Array.from(files));
      const newUrls = (uploaded ?? [])
        .map((file) => file.ufsUrl ?? file.url ?? file.appUrl)
        .filter((url): url is string => Boolean(url));

      if (newUrls.length > 0) {
        onImagesChange(item.item_id, [...inspectionImgs, ...newUrls]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
    }
  }

  function handleRemoveImage(url: string) {
    onImagesChange(
      item.item_id,
      inspectionImgs.filter((img) => img !== url)
    );
  }

  function handleNoteBlur() {
    const trimmed = noteDraft.trim();
    if (trimmed !== (userNote ?? "").trim()) {
      onNoteChange(item.item_id, trimmed);
    }
  }

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <p className={styles.itemText}>{item.display_text}</p>

        <button
          type="button"
          className={styles.itemToggle}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label="Toggle item details"
        >
          {expanded ? "▼" : "▶"}
        </button>

        <div className={styles.scoreGroup}>
          {SCORES.map((s) => (
            <button
              key={s.value}
              type="button"
              title={`Score ${s.value}`}
              disabled={busy}
              tabIndex={-1}
              aria-pressed={score === s.value}
              className={`${styles.scoreLabel} ${s.className} ${
                score === s.value ? styles.scoreLabelActive : ""
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onScoreChange(item.item_id, s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {expanded && (
        <div className={styles.itemDetails}>
          <div className={styles.detailBlock}>
            <span className={styles.detailLabel}>ข้อความต้นฉบับ</span>
            <p>{item.source_text || "—"}</p>
          </div>

          {item.notes && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>หมายเหตุ</span>
              <p>{item.notes}</p>
            </div>
          )}

          {item.img && (
            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>ภาพอ้างอิง</span>
              <img
                src={item.img}
                alt={item.imgCaption ?? item.display_text}
                className={`${styles.itemImage} ${styles.clickableImage}`}
                referrerPolicy="no-referrer"
                onClick={() => setPreviewUrl(item.img!)}
              />
              {item.imgCaption && (
                <p className={styles.imgCaption}>{item.imgCaption}</p>
              )}
            </div>
          )}

          <div className={styles.inspectionBlock}>
            <div className={styles.detailBlock}>
              <label
                className={styles.detailLabel}
                htmlFor={`note-${item.item_id}`}
              >
                Inspection notes
              </label>
              <textarea
                id={`note-${item.item_id}`}
                className={styles.noteInput}
                placeholder="Add description or notes from your inspection..."
                value={noteDraft}
                disabled={busy}
                rows={3}
                onChange={(e) => setNoteDraft(e.target.value)}
                onBlur={handleNoteBlur}
              />
              {savingNote && (
                <span className={styles.saveHint}>Saving note...</span>
              )}
            </div>

            <div className={styles.detailBlock}>
              <span className={styles.detailLabel}>Inspection photos</span>

              <div className={styles.photoGallery}>
                {inspectionImgs.length === 0 ? (
                  <p className={styles.photoGalleryEmpty}>
                    Uploaded photos appear here
                  </p>
                ) : (
                  inspectionImgs.map((url) => (
                    <div key={url} className={styles.photoTile}>
                      <button
                        type="button"
                        className={styles.photoThumbBtn}
                        disabled={busy}
                        aria-label="View full size photo"
                        onClick={() => setPreviewUrl(url)}
                      >
                        <img
                          src={url}
                          alt=""
                          className={styles.photoTileImg}
                          referrerPolicy="no-referrer"
                        />
                      </button>
                      <button
                        type="button"
                        className={styles.photoDelete}
                        disabled={busy}
                        aria-label="Remove photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(url);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className={styles.hiddenFileInput}
                disabled={busy}
                onChange={handlePhotoSelected}
              />
              <button
                type="button"
                className={styles.photoBtn}
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading || uploading ? "Uploading..." : "Upload photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full size photo"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close"
            onClick={() => setPreviewUrl(null)}
          >
            ✕
          </button>
          <img
            src={previewUrl}
            alt=""
            className={styles.lightboxImg}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
