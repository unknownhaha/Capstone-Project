'use client';

import { useState } from 'react';
import styles from './ml-assessment.module.css';

interface MLPrediction {
  risk_level: string;
  risk_class: number;
  risk_score: number;
  probabilities: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  };
  confidence: number;
}

interface MLAssessmentProps {
  inspectionData: {
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
  onResult?: (prediction: MLPrediction) => void;
  compact?: boolean;
}

export default function MLAssessment({ 
  inspectionData, 
  onResult,
  compact = false 
}: MLAssessmentProps) {
  const [result, setResult] = useState<MLPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get prediction');
      }
      
      const prediction = await response.json() as MLPrediction;
      setResult(prediction);
      onResult?.(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('ML Assessment Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number): string => {
    if (score < 40) return '#22c55e';
    if (score < 70) return '#eab308';
    return '#ef4444';
  };

  const getRiskBgColor = (score: number): string => {
    if (score < 40) return '#dcfce7';
    if (score < 70) return '#fefce8';
    return '#fee2e2';
  };

  if (compact && !result) {
    return (
      <button 
        onClick={handleAnalyze}
        disabled={loading}
        className={styles.compactButton}
        title="Analyze building risk with AI"
      >
        {loading ? '⏳' : '🤖'} {loading ? 'Analyzing...' : 'AI Risk Check'}
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🤖 ML Risk Assessment</h3>
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className={styles.analyzeButton}
        >
          {loading ? '⏳ Analyzing...' : '🎯 Analyze Building'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <span>❌ {error}</span>
        </div>
      )}

      {result && (
        <div 
          className={styles.resultContainer}
          style={{ backgroundColor: getRiskBgColor(result.risk_score) }}
        >
          {/* Risk Level Display */}
          <div 
            className={styles.riskLevel}
            style={{ color: getRiskColor(result.risk_score) }}
          >
            {result.risk_level}
          </div>

          {/* Risk Score Bar */}
          <div className={styles.scoreSection}>
            <div className={styles.scoreLabel}>
              <span>Risk Score</span>
              <span className={styles.scoreValue}>{result.risk_score}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{
                  width: `${result.risk_score}%`,
                  backgroundColor: getRiskColor(result.risk_score)
                }}
              />
            </div>
          </div>

          {/* Expandable Details */}
          <button 
            className={styles.detailsToggle}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '▼' : '▶'} Probability Breakdown
          </button>

          {showDetails && (
            <div className={styles.probabilities}>
              <div className={styles.probItem}>
                <span>🟢 Low Risk</span>
                <span>{result.probabilities.low_risk.toFixed(1)}%</span>
              </div>
              <div className={styles.probItem}>
                <span>🟡 Medium Risk</span>
                <span>{result.probabilities.medium_risk.toFixed(1)}%</span>
              </div>
              <div className={styles.probItem}>
                <span>🔴 High Risk</span>
                <span>{result.probabilities.high_risk.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {/* Confidence */}
          <div className={styles.confidence}>
            📊 Confidence: {result.confidence.toFixed(1)}%
          </div>

          {/* Risk-Based Warning */}
          {result.risk_score > 75 && (
            <div className={styles.warning} style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
              ⚠️ <strong>High Risk Warning:</strong> Consider expert evaluation and immediate action.
            </div>
          )}
          {result.risk_score > 50 && result.risk_score <= 75 && (
            <div className={styles.warning} style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
              ⚠️ <strong>Medium Risk:</strong> Schedule repairs and follow-up inspections.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
