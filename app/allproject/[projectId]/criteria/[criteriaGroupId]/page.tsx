"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  const { status, isAuthenticated } = useRequireAuth();

  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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

  const handleNoteChange = async (itemId: string, note: string) => {
    setSavingNoteId(itemId);

    try {
      const res = await fetch(
        `/api/project/${projectId}/critiria/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ note }),
        }
      );

      if (res.ok) {
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
      const res = await fetch(
        `/api/project/${projectId}/critiria/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imgs }),
        }
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.imgs)) {
        setProject((prev) =>
          prev ? patchCriterionImgs(prev, itemId, data.imgs) : prev
        );
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
    setSavingId(itemId);

    try {
      const res = await fetch(
        `/api/project/${projectId}/critiria/${encodeURIComponent(itemId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ score }),
        }
      );

      if (res.ok) {
        await loadProject();
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
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}
