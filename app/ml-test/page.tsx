"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "./ml-test.module.css";

type PredictionResult = {
  risk_level: string;
  risk_class: number;
  risk_score: number;
  probabilities: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  };
  confidence: number;
};

type FormData = {
  building_age: number;
  roof_condition: number;
  foundation_condition: number;
  electrical_issues: number;
  plumbing_issues: number;
  structural_damage: number;
  mold_presence: number;
  pest_infestation: number;
  window_condition: number;
  paint_condition: number;
  flooring_condition: number;
  hvac_condition: number;
  number_of_violations: number;
  previous_repairs: number;
};

const INITIAL: FormData = {
  building_age: 15,
  roof_condition: 2,
  foundation_condition: 2,
  electrical_issues: 2,
  plumbing_issues: 1,
  structural_damage: 1,
  mold_presence: 0,
  pest_infestation: 0,
  window_condition: 2,
  paint_condition: 2,
  flooring_condition: 2,
  hvac_condition: 2,
  number_of_violations: 2,
  previous_repairs: 1,
};

type FieldConfig = {
  key: keyof FormData;
  label: string;
  hint: string;
  min: number;
  max: number;
  lowLabel?: string;
  highLabel?: string;
};

const SECTIONS: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "Building",
    fields: [
      {
        key: "building_age",
        label: "Building age (years)",
        hint: "How old the structure is.",
        min: 0,
        max: 80,
        lowLabel: "New",
        highLabel: "Old",
      },
    ],
  },
  {
    title: "Structure",
    fields: [
      {
        key: "roof_condition",
        label: "Roof condition",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
      {
        key: "foundation_condition",
        label: "Foundation condition",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
      {
        key: "structural_damage",
        label: "Structural damage",
        hint: "Severity of visible structural issues.",
        min: 0,
        max: 3,
      },
      {
        key: "window_condition",
        label: "Windows",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
    ],
  },
  {
    title: "Systems",
    fields: [
      {
        key: "electrical_issues",
        label: "Electrical issues",
        hint: "Count or severity of electrical problems.",
        min: 0,
        max: 5,
      },
      {
        key: "plumbing_issues",
        label: "Plumbing issues",
        hint: "Count or severity of plumbing problems.",
        min: 0,
        max: 5,
      },
      {
        key: "hvac_condition",
        label: "HVAC condition",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
      {
        key: "flooring_condition",
        label: "Flooring",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
      {
        key: "paint_condition",
        label: "Paint / finishes",
        hint: "0 = excellent, 3 = poor.",
        min: 0,
        max: 3,
      },
    ],
  },
  {
    title: "Environment",
    fields: [
      {
        key: "mold_presence",
        label: "Mold present",
        hint: "0 = none, 1 = detected.",
        min: 0,
        max: 1,
      },
      {
        key: "pest_infestation",
        label: "Pest infestation",
        hint: "0 = none, 1 = detected.",
        min: 0,
        max: 1,
      },
    ],
  },
  {
    title: "History",
    fields: [
      {
        key: "number_of_violations",
        label: "Code violations",
        hint: "Recorded violations on file.",
        min: 0,
        max: 10,
      },
      {
        key: "previous_repairs",
        label: "Previous repairs",
        hint: "Major repair events in the past.",
        min: 0,
        max: 10,
      },
    ],
  },
];

function riskTone(riskClass: number) {
  if (riskClass === 0) {
    return {
      hero: styles.resultHeroLow,
      badge: styles.badgeLow,
      title: styles.riskTitleLow,
      fill: "#22c55e",
    };
  }
  if (riskClass === 1) {
    return {
      hero: styles.resultHeroMedium,
      badge: styles.badgeMedium,
      title: styles.riskTitleMedium,
      fill: "#eab308",
    };
  }
  return {
    hero: styles.resultHeroHigh,
    badge: styles.badgeHigh,
    title: styles.riskTitleHigh,
    fill: "#ef4444",
  };
}

export default function MLPredictPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceOk, setServiceOk] = useState<boolean | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/ml/predict");
      const data = await res.json();
      setServiceOk(res.ok && data.model_loaded === true);
    } catch {
      setServiceOk(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const setField = (key: keyof FormData, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      setResult(data as PredictionResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the ML service. Run ml-service on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const tone = result ? riskTone(result.risk_class) : null;

  return (
    <div className={styles.shell}>
      <div className={styles.phone}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link href="/allproject" className={styles.backLink}>
              ← Projects
            </Link>
          </div>
          <h1 className={styles.title}>Risk assessment</h1>
          <p className={styles.subtitle}>
            Random Forest model — overall low / medium / high risk from 14
            inspection metrics.
          </p>
          <span className={styles.statusPill}>
            <span
              className={`${styles.statusDot} ${
                serviceOk ? styles.statusOnline : styles.statusOffline
              }`}
              aria-hidden
            />
            {serviceOk === null
              ? "Checking ML service…"
              : serviceOk
                ? "ML service ready"
                : "ML service offline — start app.py"}
          </span>
        </header>

        <div className={styles.panel}>
          <div className={styles.panelScroll}>
            <div className={styles.introCard}>
              <strong>Demo only.</strong> This does not use your project
              criteria scores. Adjust sliders, then run predict. Train with{" "}
              <code>python train_model.py</code> in <code>ml-service/</code>.
            </div>

            <form onSubmit={handlePredict}>
              {SECTIONS.map((section) => (
                <section key={section.title} className={styles.section}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <div className={styles.fieldGrid}>
                    {section.fields.map((field) => (
                      <div key={field.key} className={styles.field}>
                        <div className={styles.fieldHeader}>
                          <span className={styles.fieldLabel}>
                            {field.label}
                          </span>
                          <span className={styles.fieldValue}>
                            {formData[field.key]}
                          </span>
                        </div>
                        <p className={styles.fieldHint}>{field.hint}</p>
                        <input
                          type="range"
                          className={styles.slider}
                          min={field.min}
                          max={field.max}
                          step={1}
                          value={formData[field.key]}
                          onChange={(e) =>
                            setField(field.key, Number(e.target.value))
                          }
                          aria-label={field.label}
                        />
                        {(field.lowLabel || field.highLabel) && (
                          <div className={styles.scaleLabels}>
                            <span>{field.lowLabel ?? field.min}</span>
                            <span>{field.highLabel ?? field.max}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || serviceOk === false}
              >
                {loading ? "Analyzing…" : "Run risk prediction"}
              </button>
            </form>

            {error && (
              <div className={styles.errorBox} role="alert">
                {error}
              </div>
            )}

            {result && tone && (
              <article className={styles.resultCard}>
                <div className={`${styles.resultHero} ${tone.hero}`}>
                  <span className={`${styles.riskBadge} ${tone.badge}`}>
                    Class {result.risk_class}
                  </span>
                  <h2 className={`${styles.riskTitle} ${tone.title}`}>
                    {result.risk_level}
                  </h2>
                  <div className={styles.gaugeWrap}>
                    <div className={styles.gaugeTrack}>
                      <div
                        className={styles.gaugeFill}
                        style={{
                          width: `${result.risk_score}%`,
                          backgroundColor: tone.fill,
                        }}
                      />
                    </div>
                    <div className={styles.gaugeMeta}>
                      <span>Confidence score</span>
                      <span>{result.risk_score}%</span>
                    </div>
                  </div>
                </div>

                <div className={styles.resultBody}>
                  <div className={styles.probList}>
                    <div className={styles.probRow}>
                      <span className={styles.probLabel}>Low risk</span>
                      <div className={styles.probBar}>
                        <div
                          className={styles.probFillLow}
                          style={{
                            width: `${result.probabilities.low_risk}%`,
                          }}
                        />
                      </div>
                      <span className={styles.probPct}>
                        {result.probabilities.low_risk.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.probRow}>
                      <span className={styles.probLabel}>Medium risk</span>
                      <div className={styles.probBar}>
                        <div
                          className={styles.probFillMedium}
                          style={{
                            width: `${result.probabilities.medium_risk}%`,
                          }}
                        />
                      </div>
                      <span className={styles.probPct}>
                        {result.probabilities.medium_risk.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.probRow}>
                      <span className={styles.probLabel}>High risk</span>
                      <div className={styles.probBar}>
                        <div
                          className={styles.probFillHigh}
                          style={{
                            width: `${result.probabilities.high_risk}%`,
                          }}
                        />
                      </div>
                      <span className={styles.probPct}>
                        {result.probabilities.high_risk.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className={styles.confidenceLine}>
                    Model confidence:{" "}
                    <strong>{result.confidence.toFixed(1)}%</strong>
                  </p>

                  {result.risk_class === 2 && (
                    <div
                      className={`${styles.advisory} ${styles.advisoryHigh}`}
                    >
                      High risk — consider a professional inspection and
                      prioritized repairs.
                    </div>
                  )}
                  {result.risk_class === 1 && (
                    <div
                      className={`${styles.advisory} ${styles.advisoryMedium}`}
                    >
                      Medium risk — schedule follow-up checks and planned
                      maintenance.
                    </div>
                  )}
                </div>
              </article>
            )}

            <p className={styles.disclaimer}>
              Predictions are illustrative. Not a substitute for licensed
              structural assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
