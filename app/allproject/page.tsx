"use client";

import { useState } from "react";
import styles from "./allproject.module.css";

export default function DashboardPage() {
  const [openMenu, setOpenMenu] = useState(false);      // sidebar
  const [openCreate, setOpenCreate] = useState(false);  // modal

  return (
    <div className={styles.container}>
      <div className={styles.phone}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>My Project</h2>
            <p>รวมโปรเจค</p>
          </div>
          <div className={styles.menu} onClick={() => setOpenMenu(true)}>
            ≡
          </div>
        </div>

        {/* Overlay (ใช้ร่วมกัน) */}
        {(openMenu || openCreate) && (
          <div
            className={styles.overlay}
            onClick={() => {
              setOpenMenu(false);
              setOpenCreate(false);
            }}
          />
        )}

        {/* Sidebar */}
        <div className={`${styles.sidebar} ${openMenu ? styles.show : ""}`}>
          <p className={styles.menuItem}>Profile</p>
          <p className={styles.menuItem}>Search Profile</p>
        </div>

        {/* Top */}
        <div className={styles.top}>
          <div
            className={styles.addBox}
            onClick={() => setOpenCreate(true)}
          >
            +
          </div>
          <div className={styles.profile}></div>
        </div>

        {/* Search */}
        <div className={styles.search}>
          <span>🔍</span>
          <input placeholder="Search..." />
          <span>≡</span>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.thumb}></div>
              <p>Project Name</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          <span className={styles.active}></span>
          <span></span>
          <span></span>
        </div>

        {/* 🔥 Create Project Modal */}
        <div
          className={`${styles.createBox} ${
            openCreate ? styles.showCreate : ""
          }`}
        >
          <h3>สร้างโปรเจค</h3>

          <div className={styles.inputGroup}>
            <span>📍</span>
            <input placeholder="สถานที่" />
          </div>

          <input className={styles.input} placeholder="ชื่อโปรเจค" />
          <input className={styles.input} placeholder="รายละเอียด" />
          <input className={styles.input} placeholder="อื่น ๆ" />

          <button className={styles.submit}>สร้างโปรเจค</button>
        </div>

      </div>
    </div>
  );
}