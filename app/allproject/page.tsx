"use client";

import { useState } from "react";
import styles from "./allproject.module.css";

const inspectionItems = [
  "Fire Alarm System",
  "Emergency Exit",
  "Electrical Panel",
  "Smoke Detector",
  "Lighting System",
  "Cleanliness",
  "Water Leakage",
  "Structure Safety",
];

export default function DashboardPage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [openInspection, setOpenInspection] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");

  // ✅ state สำหรับปุ่ม pass/fail
  const [checkStatus, setCheckStatus] = useState<{
    [key: string]: "pass" | "fail" | null;
  }>({});

  // ✅ เปิด project
  const openProject = (name: string) => {
    setSelectedProject(name);
    setOpenInspection(true);
  };

  // ✅ กด pass/fail ได้จริง
  const updateCheck = (
    item: string,
    status: "pass" | "fail"
  ) => {
  setCheckStatus((prev) => {
    // ✅ ถ้ากดซ้ำ ให้ unselect
    if (prev[item] === status) {
      const updated = { ...prev };

      delete updated[item];

      return updated;
    }

    // ✅ ถ้าไม่ได้กดซ้ำ เปลี่ยนสถานะปกติ
    return {
      ...prev,
      [item]: status,
    };
  });
};

  // ✅ progress คำนวณจริง
  const completed =
    Object.keys(checkStatus).length;

  const progress =
    (completed / inspectionItems.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.phone}>
        
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2>My Project</h2>
            <p>Inspection Dashboard</p>
          </div>

          <div
            className={styles.menu}
            onClick={() => setOpenMenu(true)}
          >
            ☰
          </div>
        </div>

        {/* OVERLAY */}
        {(openMenu || openCreate || openInspection) && (
          <div
            className={styles.overlay}
            onClick={() => {
              setOpenMenu(false);
              setOpenCreate(false);
              setOpenInspection(false);
            }}
          />
        )}

        {/* SIDEBAR */}
        <div
          className={`${styles.sidebar} ${
            openMenu ? styles.showSidebar : ""
          }`}
        >
          <h3>Menu</h3>

          <div className={styles.menuItem}>
            Profile
          </div>

          <div className={styles.menuItem}>
            Reports
          </div>

          <div className={styles.menuItem}>
            Settings
          </div>
        </div>

        {/* TOP */}
        <div className={styles.top}>
          <div
            className={styles.addBox}
            onClick={() => setOpenCreate(true)}
          >
            +
          </div>

          <div className={styles.profile}></div>
        </div>

        {/* SEARCH */}
        <div className={styles.search}>
          <span>🔍</span>

          <input placeholder="Search Project..." />

          <span>⚙️</span>
        </div>

        {/* PROJECT GRID */}
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={styles.card}
              onClick={() =>
                openProject(`Building ${i}`)
              }
            >
              <div className={styles.thumb}></div>

              <div className={styles.cardInfo}>
                <h4>Building {i}</h4>

                <span>12 Checkpoints</span>
              </div>

              <div className={styles.status}>
                In Progress
              </div>
            </div>
          ))}
        </div>

        {/* DOTS */}
        <div className={styles.dots}>
          <span className={styles.active}></span>
          <span></span>
          <span></span>
        </div>

        {/* CREATE PROJECT */}
        <div
          className={`${styles.createBox} ${
            openCreate ? styles.showCreate : ""
          }`}
        >
          <h3>Create Project</h3>

          <div className={styles.inputGroup}>
            <span>📍</span>

            <input placeholder="Location" />
          </div>

          <input
            className={styles.input}
            placeholder="Project Name"
          />

          <textarea
            className={styles.textarea}
            placeholder="Description"
          />

          <button className={styles.submit}>
            Create Project
          </button>
        </div>

        {/* INSPECTION FORM */}
        <div
          className={`${styles.inspectionBox} ${
            openInspection
              ? styles.showInspection
              : ""
          }`}
        >
          {/* HEADER */}
          <div className={styles.inspectHeader}>
            <div>
              <h3>{selectedProject}</h3>

              <p>Building Inspection Form</p>
            </div>

            <div
              className={styles.closeBtn}
              onClick={() =>
                setOpenInspection(false)
              }
            >
              ✕
            </div>
          </div>

          {/* PROGRESS */}
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>

          <p className={styles.progressText}>
            Progress {Math.floor(progress)}%
          </p>

          {/* CHECKLIST */}
          <div className={styles.checklist}>
            {inspectionItems.map((item, index) => (
              <div
                key={index}
                className={styles.checkItem}
              >
                <p>{item}</p>

                <div
                  className={styles.checkButtons}
                >
                  {/* PASS */}
                  <button
                    className={
                      checkStatus[item] === "pass"
                        ? styles.passActive
                        : styles.pass
                    }
                    onClick={() =>
                      updateCheck(item, "pass")
                    }
                  >
                    ✓
                  </button>

                  {/* FAIL */}
                  <button
                    className={
                      checkStatus[item] === "fail"
                        ? styles.failActive
                        : styles.fail
                    }
                    onClick={() =>
                      updateCheck(item, "fail")
                    }
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* NOTE */}
          <textarea
            className={styles.note}
            placeholder="Inspection Notes..."
          />

          {/* IMAGE */}
          <div className={styles.uploadBox}>
            <label>Upload Evidence</label>

            <input type="file" />
          </div>

          {/* SAVE */}
          <button className={styles.saveBtn}>
            Save Inspection
          </button>
        </div>
      </div>
    </div>
  );
}