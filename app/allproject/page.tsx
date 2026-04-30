"use client";

import styles from "./allproject.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.phone}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>My Project</h2>
            <p>รวมโปรเจค</p>
          </div>
          <div className={styles.menu}>≡</div>
        </div>

        {/* Top section */}
        <div className={styles.top}>
          <div className={styles.addBox}>+</div>
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
          {[1,2,3,4].map((i) => (
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

      </div>
    </div>
  );
}