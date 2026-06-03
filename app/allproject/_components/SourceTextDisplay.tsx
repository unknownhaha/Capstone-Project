"use client";

import { parseSourceTextForDisplay } from "@/lib/standards/format-source-text";
import styles from "./items.module.css";

type Props = {
  sourceText: string;
};

export default function SourceTextDisplay({ sourceText }: Props) {
  const sections = parseSourceTextForDisplay(sourceText);

  if (sections.length === 0) {
    return <p className={styles.sourceTextEmpty}>—</p>;
  }

  return (
    <div className={styles.sourceTextDisplay}>
      {sections.map((section, i) => (
        <div key={`${section.heading ?? "body"}-${i}`} className={styles.sourceTextSection}>
          {section.heading ? (
            <p className={styles.sourceTextSectionTitle}>{section.heading}</p>
          ) : null}
          <ul className={styles.sourceTextList}>
            {section.bullets.map((bullet, j) => (
              <li key={j}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
