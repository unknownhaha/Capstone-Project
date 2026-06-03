"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getAllSelectableGroupIds,
  STANDARDS_CATALOG,
} from "@/lib/standards/catalog";
import styles from "./section.module.css";

export type ProjectSectionView = {
  code: string;
  title: string;
  groupIds: string[];
};

type SectionPickerProps =
  | {
      mode: "select";
      selectedGroupIds: Set<string>;
      onToggleGroup: (groupId: string) => void;
      onSelectAll?: () => void;
      onClearAll?: () => void;
      variant?: "create" | "default";
    }
  | {
      mode: "navigate";
      projectId: string;
      sections: ProjectSectionView[];
    };

export default function SectionPicker(props: SectionPickerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (code: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (props.mode === "select") {
    const isCreate = props.variant === "create";
    const listClass = isCreate
      ? styles.sectionListCreate
      : styles.sectionList;
    const allIds = getAllSelectableGroupIds();
    const allSelected =
      allIds.length > 0 && allIds.every((id) => props.selectedGroupIds.has(id));

    return (
      <div className={listClass}>
        <div className={styles.selectToolbar}>
          <button
            type="button"
            className={styles.selectAllBtn}
            onClick={() => {
              if (allSelected) {
                props.onClearAll?.();
              } else {
                props.onSelectAll?.();
              }
            }}
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          <span className={styles.selectToolbarMeta}>
            {props.selectedGroupIds.size} / {allIds.length}
          </span>
        </div>
        {STANDARDS_CATALOG.map((section) => {
          const isOpen = expandedSections.has(section.code);
          return (
            <div
              key={`${section.code}-${section.title}`}
              className={`${styles.sectionCard} ${isCreate ? styles.sectionCardCreate : ""}`}
            >
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection(section.code)}
              >
                <h4 className={styles.sectionTitle}>{section.title}</h4>
                <button
                  type="button"
                  className={styles.toggleBtn}
                  aria-label={isOpen ? "Collapse section" : "Expand section"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.code);
                  }}
                >
                  {isOpen ? "▼" : "▶"}
                </button>
              </div>

              {isOpen && (
                <div
                  className={isCreate ? styles.groupListCreate : styles.groupList}
                >
                  {section.groups.length === 0 && (
                    <p className={styles.emptyGroups}>No criteria in this section</p>
                  )}
                  {section.groups.map((group) => (
                    <label key={group.id} className={styles.groupRow}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={props.selectedGroupIds.has(group.id)}
                        onChange={() => props.onToggleGroup(group.id)}
                      />
                      <span className={styles.groupTitle}>{group.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.sectionList}>
      {props.sections.map((section) => {
        const isOpen = expandedSections.has(section.code);
        const catalogSection = STANDARDS_CATALOG.find((s) => s.code === section.code);

        return (
          <div key={section.code} className={styles.sectionCard}>
            <div
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.code)}
            >
              <h4 className={styles.sectionTitle}>{section.title}</h4>
              <button type="button" className={styles.toggleBtn}>
                {isOpen ? "▼" : "▶"}
              </button>
            </div>

            {isOpen && (
              <div className={styles.groupList}>
                {section.groupIds.map((groupId) => {
                  const group = catalogSection?.groups.find((g) => g.id === groupId);
                  if (!group) return null;

                  return (
                    <Link
                      key={groupId}
                      href={`/allproject/${props.projectId}/criteria/${encodeURIComponent(groupId)}`}
                      className={styles.groupRowLink}
                    >
                      <span className={styles.navArrow}>▶</span>
                      <span className={styles.groupTitle}>{group.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
