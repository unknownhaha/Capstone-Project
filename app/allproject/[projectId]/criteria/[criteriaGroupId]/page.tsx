"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { findCatalogGroup } from "@/lib/standards/catalog";
import PhoneShell from "../../../_components/PhoneShell";
import InspectionItemRow from "../../../_components/InspectionItemRow";
import { useRequireAuth } from "../../../_components/useRequireAuth";
import {
  getCriterionImages,
  type ApiProject,
} from "../../../_components/project-utils";
import itemStyles from "../../../_components/items.module.css";

function patchCriterionImgs(
  project: ApiProject,
  itemId: string,
  imgs: string[]
): ApiProject {
  return {
    ...project,
    sections: project.sections.map((section) => ({
      ...section,
      criteria: section.criteria.map((criterion) =>
        criterion.criteriaId === itemId
          ? {
              ...criterion,
              imgs,
              img: imgs[imgs.length - 1],
            }
          : criterion
      ),
    })),
  };
}

export default function CriteriaItemsPage() {
  const { projectId, criteriaGroupId } = useParams<{
    projectId: string;
    criteriaGroupId: string;
  }>();
  const groupId = decodeURIComponent(criteriaGroupId);
  const router = useRouter();
  const { status, isAuthenticated } = useRequireAuth();

  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const catalogMatch = findCatalogGroup(groupId);

  const loadProject = useCallback(async () => {
    const res = await fetch(`/api/project/${projectId}`, {
      credentials: "include",
    });
    if (res.ok) {
      setProject(await res.json());
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (!isAuthenticated || !projectId) return;
    loadProject();
  }, [isAuthenticated, projectId, loadProject]);

  const getCriterion = (itemId: string) => {
    if (!project) return null;
    for (const section of project.sections) {
      const found = section.criteria.find((c) => c.criteriaId === itemId);
      if (found) return found;
    }
    return null;
  };

  const getScore = (itemId: string): number | null =>
    getCriterion(itemId)?.score ?? null;

  const getInspectionImgs = (itemId: string): string[] => {
    const criterion = getCriterion(itemId);
    return criterion ? getCriterionImages(criterion) : [];
  };

  const getUserNote = (itemId: string): string | null =>
    getCriterion(itemId)?.note ?? null;

  const patchCriterion = async (
    itemId: string,
    body: Record<string, unknown>
  ): Promise<boolean> => {
    const criterion = getCriterion(itemId);
    const payload = {
      ...body,
      ...(criterion?.updatedAt
        ? { expectedUpdatedAt: criterion.updatedAt }
        : {}),
    };

    const res = await fetch(
      `/api/project/${projectId}/critiria/${encodeURIComponent(itemId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    if (res.status === 409) {
      setConflictMsg(
        "Updated by another inspector — refresh and try again."
      );
      await loadProject();
      return false;
    }

    if (!res.ok) return false;

    const data = await res.json();
    if (data.updatedAt) {
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((section) => ({
            ...section,
            criteria: section.criteria.map((c) =>
              c.criteriaId === itemId
                ? { ...c, updatedAt: data.updatedAt }
                : c
            ),
          })),
        };
      });
    }

    setConflictMsg(null);
    return true;
  };

  const handleNoteChange = async (itemId: string, note: string) => {
    setSavingNoteId(itemId);

    try {
      if (await patchCriterion(itemId, { note })) {
        await loadProject();
      }
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleImagesChange = async (itemId: string, imgs: string[]) => {
    setUploadingId(itemId);
    const snapshot = project;
    setProject((prev) => (prev ? patchCriterionImgs(prev, itemId, imgs) : prev));

    try {
      const criterion = getCriterion(itemId);
      const res = await fetch(
        `/api/project/${projectId}/critiria/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            imgs,
            ...(criterion?.updatedAt
              ? { expectedUpdatedAt: criterion.updatedAt }
              : {}),
          }),
        }
      );

      const data = await res.json();

      if (res.status === 409) {
        setConflictMsg(
          "Updated by another inspector — refresh and try again."
        );
        setProject(snapshot);
        await loadProject();
        return;
      }

      if (res.ok && Array.isArray(data.imgs)) {
        setProject((prev) =>
          prev ? patchCriterionImgs(prev, itemId, data.imgs) : prev
        );
        setConflictMsg(null);
      } else {
        setProject(snapshot);
        console.error("Failed to save images:", data);
      }
    } catch (err) {
      setProject(snapshot);
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  };

  const handleScoreChange = async (itemId: string, score: number) => {
    const previousScore = getScore(itemId);
    setSavingId(itemId);
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          criteria: section.criteria.map((c) =>
            c.criteriaId === itemId ? { ...c, score } : c
          ),
        })),
      };
    });

    try {
      const ok = await patchCriterion(itemId, { score });
      if (!ok) {
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((section) => ({
              ...section,
              criteria: section.criteria.map((c) =>
                c.criteriaId === itemId
                  ? { ...c, score: previousScore ?? null }
                  : c
              ),
            })),
          };
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  if (status === "loading" || !isAuthenticated) {
    return (
      <div className={itemStyles.loading}>Loading...</div>
    );
  }

  if (loading) {
    return (
      <PhoneShell title="Criteria" subtitle="Loading...">
        <p className={itemStyles.loading}>Loading items...</p>
      </PhoneShell>
    );
  }

  if (!catalogMatch || !project) {
    return (
      <PhoneShell title="Criteria" subtitle="Not found">
        <div className={itemStyles.page}>
          <div className={itemStyles.contentPanel}>
            <div className={itemStyles.contentPanelInner}>
              <Link
                href={`/allproject/${projectId}`}
                className={itemStyles.backLink}
              >
                <span className={itemStyles.backIcon} aria-hidden>
                  ←
                </span>
                Back
              </Link>
            </div>
          </div>
        </div>
      </PhoneShell>
    );
  }

  const projectItemIds = new Set(
    project.sections.flatMap((s) => s.criteria.map((c) => c.criteriaId))
  );

  const items = catalogMatch.group.items.filter((item) =>
    projectItemIds.has(item.item_id)
  );

  const scoredCount = items.filter(
    (item) => getScore(item.item_id) !== null
  ).length;
  const allScored = items.length > 0 && scoredCount === items.length;

  return (
    <PhoneShell
      title={project.projectName}
      subtitle={catalogMatch.section.title}
      showMenu={false}
    >
      <div className={itemStyles.page}>
        <div className={itemStyles.contentPanel}>
          <div className={itemStyles.contentPanelInner}>
            <Link
              href={`/allproject/${projectId}`}
              className={itemStyles.backLink}
            >
              <span className={itemStyles.backIcon} aria-hidden>
                ←
              </span>
              Back
            </Link>

            <h1 className={itemStyles.groupHeading}>
              {catalogMatch.group.title}
            </h1>

            {conflictMsg && (
              <p role="alert" className={itemStyles.conflictNotice}>
                {conflictMsg}
              </p>
            )}

            <p className={itemStyles.checklistProgress}>
              {scoredCount} of {items.length} scored
            </p>

            <div className={itemStyles.itemsList}>
              {items.map((item) => (
                <InspectionItemRow
                  key={item.item_id}
                  item={item}
                  score={getScore(item.item_id)}
                  userNote={getUserNote(item.item_id)}
                  inspectionImgs={getInspectionImgs(item.item_id)}
                  saving={savingId === item.item_id}
                  savingNote={savingNoteId === item.item_id}
                  uploading={uploadingId === item.item_id}
                  onScoreChange={handleScoreChange}
                  onNoteChange={handleNoteChange}
                  onImagesChange={handleImagesChange}
                />
              ))}
            </div>

            <div className={itemStyles.checklistFooter}>
              <p className={itemStyles.checklistFooterHint}>
                {allScored
                  ? "All checkpoints in this group are scored. Return to the criteria list."
                  : "Score every checkpoint to finish this group."}
              </p>
              <button
                type="button"
                className={itemStyles.checklistSubmitBtn}
                disabled={!allScored}
                onClick={() => router.push(`/allproject/${projectId}`)}
              >
                Back to criteria
              </button>
            </div>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
