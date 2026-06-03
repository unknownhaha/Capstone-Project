"use client";

import dynamic from "next/dynamic";
import styles from "./api-docs.module.css";

const ApiDocsClient = dynamic(() => import("./ApiDocsClient"), {
  ssr: false,
  loading: () => (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>API reference · เอกสาร API</h1>
        <p className={styles.subtitle}>Loading API documentation…</p>
      </header>
    </div>
  ),
});

export default function ApiDocsPage() {
  return <ApiDocsClient />;
}
