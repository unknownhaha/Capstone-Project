"use client";

import { useState } from "react";
import type { CatalogItem } from "@/lib/standards/catalog";
import styles from "./items.module.css";

type InspectionItemRowProps = {
  item: CatalogItem;
  score: number | null;
  onScoreChange: (itemId: string, score: number) => void;
  saving?: boolean;
};

const SCORES = [
  { value: 0, label: "0", className: styles.scoreRed },
  { value: 1, label: "1", className: styles.scoreYellow },
  { value: 2, label: "2", className: styles.scoreGreen },
] as const;

export default function InspectionItemRow({
  item,
  score,
  onScoreChange,
  saving,
}: InspectionItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <p className={styles.itemText}>{item.display_text}</p>

        <button
          type="button"
          className={styles.itemToggle}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "▼" : "▶"}
        </button>

        <div className={styles.scoreGroup}>
          {SCORES.map((s) => (
            <label key={s.value} title={`Score ${s.value}`}>
              <input
                type="radio"
                name={`score-${item.item_id}`}
                className={styles.scoreRadio}
                checked={score === s.value}
                disabled={saving}
                onChange={() => onScoreChange(item.item_id, s.value)}
              />
              <span
                className={`${styles.scoreLabel} ${s.className} ${
                  score === s.value ? styles.scoreLabelActive : ""
                }`}
              >
                {s.label}
              </span>
            </label>
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
            <img
              src={item.img}
              alt={item.display_text}
              className={styles.itemImage}
            />
          )}
        </div>
      )}
    </div>
  );
}
