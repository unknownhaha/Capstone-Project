# 🔗 ML Integration Guide - Frontend Implementation

## How to Use ML Predictions in Your Frontend

Your inspection app collects building data through criteria forms. Here's how to integrate ML predictions at different stages.

---

## Option 1: Quick Integration (Easiest)

### Add a "Get Risk Assessment" Button to Your Inspection Form

```typescript
// In your inspection page component
import { useState } from 'react';

export default function InspectionPage() {
  const [scores, setScores] = useState({
    // Your existing scores
  });
  
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  // NEW: Get ML prediction
  const handleGetRiskAssessment = async () => {
    setMlLoading(true);
    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building_age: scores.buildingAge,
          roof_condition: scores.roof,
          foundation_condition: scores.foundation,
          electrical_issues: scores.electrical,
          plumbing_issues: scores.plumbing,
          structural_damage: scores.structural,
          mold_presence: scores.mold ? 1 : 0,
          pest_infestation: scores.pest ? 1 : 0,
          window_condition: scores.windows,
          paint_condition: scores.paint,
          flooring_condition: scores.flooring,
          hvac_condition: scores.hvac,
          number_of_violations: scores.violations,
          previous_repairs: scores.repairs
        })
      });

      if (response.ok) {
        const prediction = await response.json();
        setMlPrediction(prediction);
      }
    } catch (err) {
      console.error('ML prediction failed:', err);
    } finally {
      setMlLoading(false);
    }
  };

  return (
    <div>
      {/* Your existing inspection form */}
      
      {/* NEW: Add ML prediction button and results */}
      <button 
        onClick={handleGetRiskAssessment}
        disabled={mlLoading}
        style={{ padding: '10px 20px', marginTop: '20px' }}
      >
        {mlLoading ? 'Analyzing...' : 'Get ML Risk Assessment'}
      </button>

      {mlPrediction && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}>
          <h3>📊 ML Risk Assessment</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {mlPrediction.risk_level}
          </p>
          <p>Risk Score: {mlPrediction.risk_score}%</p>
          <p>Confidence: {mlPrediction.confidence.toFixed(1)}%</p>
          
          <details>
            <summary>Probability Breakdown</summary>
            <ul>
              <li>Low Risk: {mlPrediction.probabilities.low_risk.toFixed(1)}%</li>
              <li>Medium Risk: {mlPrediction.probabilities.medium_risk.toFixed(1)}%</li>
              <li>High Risk: {mlPrediction.probabilities.high_risk.toFixed(1)}%</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
```

---

## Option 2: Auto-Prediction (Recommended)

### Automatically Get ML Prediction After Form Submission

```typescript
// In your inspection submission handler
const handleSubmitInspection = async (formData) => {
  // 1. First, submit your inspection normally
  const inspectionRes = await fetch('/api/inspections', {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  const inspectionData = await inspectionRes.json();

  // 2. THEN, get ML prediction automatically
  const mlPrediction = await fetch('/api/ml/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapInspectionToML(formData))
  }).then(r => r.json());

  // 3. Save ML prediction with inspection
  await fetch(`/api/inspections/${inspectionData.id}/ml-assessment`, {
    method: 'POST',
    body: JSON.stringify({
      risk_level: mlPrediction.risk_level,
      risk_score: mlPrediction.risk_score,
      confidence: mlPrediction.confidence,
      probabilities: mlPrediction.probabilities
    })
  });

  return { inspection: inspectionData, mlAssessment: mlPrediction };
};
```

---

## Option 3: Real-Time Component (Best UX)

### Create a Reusable ML Assessment Component

```typescript
// components/MLAssessment.tsx
'use client';

import { useState } from 'react';

interface MLAssessmentProps {
  inspectionData: any;
  onResult?: (prediction: any) => void;
}

export function MLAssessment({ inspectionData, onResult }: MLAssessmentProps) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      });

      if (!response.ok) throw new Error('Failed to get prediction');
      
      const prediction = await response.json();
      setResult(prediction);
      onResult?.(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return '#22c55e'; // green
    if (score < 70) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3>🤖 ML Risk Assessment</h3>
      
      <button 
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '⏳ Analyzing...' : '🎯 Analyze Building'}
      </button>

      {error && <p style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: '15px' }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: getRiskColor(result.risk_score),
            marginBottom: '10px'
          }}>
            {result.risk_level}
          </div>

          {/* Risk Score Bar */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Risk Score</span>
              <span>{result.risk_score}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${result.risk_score}%`,
                backgroundColor: getRiskColor(result.risk_score),
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Probability Breakdown */}
          <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
            <strong>Probability Breakdown:</strong>
            <div style={{ fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>
              <div>🟢 Low Risk: {result.probabilities.low_risk.toFixed(1)}%</div>
              <div>🟡 Medium Risk: {result.probabilities.medium_risk.toFixed(1)}%</div>
              <div>🔴 High Risk: {result.probabilities.high_risk.toFixed(1)}%</div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Confidence: {result.confidence.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

**Use it in your inspection page:**
```typescript
import { MLAssessment } from '@/components/MLAssessment';

export default function InspectionPage() {
  const [inspectionData, setInspectionData] = useState({
    building_age: 25,
    roof_condition: 2,
    // ... 12 more fields
  });

  return (
    <div>
      {/* Your inspection form */}
      
      {/* Add ML component */}
      <MLAssessment 
        inspectionData={inspectionData}
        onResult={(prediction) => {
          console.log('ML Prediction:', prediction);
          // Save prediction, show in report, etc.
        }}
      />
    </div>
  );
}
```

---

## Option 4: Integration with Your Existing InspectionItemRow

### Modify InspectionItemRow to Support ML

Add this hook to collect all scores in a parent component:

```typescript
// In your criteria/inspection form page
import { useState, useEffect } from 'react';
import { MLAssessment } from '@/components/MLAssessment';
import InspectionItemRow from './_components/InspectionItemRow';

export default function CriteriaPage() {
  const [scores, setScores] = useState({});
  const [mlData, setMlData] = useState(null);

  // Map your inspection scores to ML features
  const mapScoresToML = (scores) => {
    return {
      building_age: scores.building_age || 0,
      roof_condition: scores.roof || 0,
      foundation_condition: scores.foundation || 0,
      electrical_issues: scores.electrical || 0,
      plumbing_issues: scores.plumbing || 0,
      structural_damage: scores.structural || 0,
      mold_presence: scores.mold ? 1 : 0,
      pest_infestation: scores.pest ? 1 : 0,
      window_condition: scores.windows || 0,
      paint_condition: scores.paint || 0,
      flooring_condition: scores.flooring || 0,
      hvac_condition: scores.hvac || 0,
      number_of_violations: scores.violations || 0,
      previous_repairs: scores.repairs || 0
    };
  };

  useEffect(() => {
    setMlData(mapScoresToML(scores));
  }, [scores]);

  const handleScoreChange = (itemId, score) => {
    setScores(prev => ({
      ...prev,
      [itemId]: score
    }));
  };

  return (
    <div>
      {/* Your inspection items */}
      <InspectionItemRow 
        item={item}
        score={scores[item.item_id]}
        onScoreChange={handleScoreChange}
        // ... other props
      />

      {/* ML Assessment below form */}
      {mlData && <MLAssessment inspectionData={mlData} />}
    </div>
  );
}
```

---

## Option 5: Automatic Risk Flagging

### Show Warning for High-Risk Buildings

```typescript
// In your inspection form or results page
const checkRisk = async (inspectionData) => {
  const response = await fetch('/api/ml/predict', {
    method: 'POST',
    body: JSON.stringify(inspectionData)
  });

  const prediction = await response.json();

  // Show warning if high risk
  if (prediction.risk_score > 75) {
    return {
      warning: true,
      message: `⚠️ WARNING: This building is HIGH RISK (${prediction.risk_score}%). Consider additional expert evaluation.`,
      severity: 'critical',
      prediction
    };
  } else if (prediction.risk_score > 50) {
    return {
      warning: true,
      message: `⚠️ Medium risk detected (${prediction.risk_score}%). Recommend repairs.`,
      severity: 'warning',
      prediction
    };
  }

  return { warning: false, prediction };
};

// Use in form submission
const handleSubmit = async (data) => {
  const riskCheck = await checkRisk(data);
  
  if (riskCheck.warning) {
    const confirmed = window.confirm(riskCheck.message + '\n\nContinue anyway?');
    if (!confirmed) return;
  }

  // Proceed with submission
  await saveInspection(data, riskCheck.prediction);
};
```

---

## Complete Feature Checklist

Add these to your app one by one:

### ✅ Step 1: Display Risk Score
Show ML prediction result in inspection summary

### ✅ Step 2: Color-Code Risk Levels
Green for low, yellow for medium, red for high

### ✅ Step 3: Show Top Risk Factors
Display which factors matter most

### ✅ Step 4: Auto-Calculate After Submit
Predict automatically when inspection is submitted

### ✅ Step 5: Flag High-Risk Buildings
Warn users about dangerous buildings

### ✅ Step 6: Generate ML Report
Include prediction in generated inspection report

### ✅ Step 7: Track Over Time
Show how risk changes for same building

---

## Field Mapping Reference

Map your form fields to ML input features:

```typescript
const fieldMapping = {
  // Your form field → ML feature
  'buildingAge' → 'building_age',
  'roofCondition' → 'roof_condition',
  'foundationCondition' → 'foundation_condition',
  'electricalIssues' → 'electrical_issues',
  'plumbingIssues' → 'plumbing_issues',
  'structuralDamage' → 'structural_damage',
  'moldPresent' → 'mold_presence' (convert boolean to 0/1),
  'pestInfestation' → 'pest_infestation' (convert boolean to 0/1),
  'windowCondition' → 'window_condition',
  'paintCondition' → 'paint_condition',
  'flooringCondition' → 'flooring_condition',
  'hvacCondition' → 'hvac_condition',
  'violationCount' → 'number_of_violations',
  'repairCount' → 'previous_repairs'
};
```

All numeric fields should be integers in the range 0-3 (for conditions) or 0-10 (for counts).

---

## Error Handling

```typescript
// Graceful fallback if ML service is down
const getPrediction = async (data) => {
  try {
    const response = await fetch('/api/ml/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      console.warn('ML service error:', response.status);
      return null; // Silently fail, app continues
    }

    return await response.json();
  } catch (err) {
    console.warn('ML prediction unavailable:', err);
    return null; // App works without ML
  }
};
```

---

## Summary

Choose your integration level:
1. **Easy** → Add a button to show results (Option 1)
2. **Better** → Auto-predict after submit (Option 2)
3. **Best** → Reusable component (Option 3)
4. **Advanced** → Full integration (Options 4-5)

Start simple, improve gradually! 🚀
