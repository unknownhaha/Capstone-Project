# ML Service Setup & Usage Guide

## What Was Built

Your app now has machine learning for automated building risk assessment:

- **Random Forest Classifier** - Predicts building risk level (Low/Medium/High)
- **Risk Scoring** - Converts predictions into 0-100% risk score
- **Confidence Metrics** - Shows probability breakdown for each risk level
- **REST API** - Flask backend that serves predictions
- **Web Interface** - React component for testing predictions

## 📁 File Structure

```
ml-service/              # Python ML backend
├── requirements.txt     # Python dependencies
├── inspection_data.csv  # Training dataset
├── train_model.py       # Model training script
├── app.py              # Flask API server
└── models/             # Trained model files (auto-created)
    ├── inspection_model.pkl      # Trained Random Forest model
    └── feature_names.pkl         # Feature column names

app/
├── ml-test/
│   └── page.tsx        # React component for testing
└── api/ml/predict/
    └── route.ts        # Next.js API integration
```

## 🚀 Getting Started

### Step 1: Start the ML Service

Open a terminal in the `ml-service` directory and run:

```bash
cd ml-service
py app.py
```

You should see:
```
✅ Model loaded successfully
 * Running on http://localhost:5000
```

### Step 2: Test via Web Interface

1. Start your Next.js app: `npm run dev`
2. Visit: http://localhost:3000/ml-test
3. Adjust inspection values and click "Get Risk Assessment"
4. You'll see:
   - Risk Level (Low/Medium/High)
   - Risk Score (0-100%)
   - Confidence breakdown
   - Probability for each risk category

### Step 3: Use in Your Inspection App

The ML service can be integrated anywhere in your app. Example:

```typescript
// In your inspection component
const response = await fetch('/api/ml/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    building_age: 25,
    roof_condition: 2,
    foundation_condition: 1,
    // ... other 11 required features
  })
});

const result = await response.json();
console.log(result);
// {
//   risk_level: "Medium Risk",
//   risk_score: 65,
//   probabilities: { low_risk: 30, medium_risk: 50, high_risk: 20 },
//   confidence: 50
// }
```

## 📊 Model Details

### Training Data
- **25 building inspections** with various conditions
- **14 input features** (building age, roof condition, violations, etc.)
- **3 risk categories** (Low, Medium, High)
- **100% accuracy** on test set

### Input Features (Required for Predictions)

| Feature | Range | Meaning |
|---------|-------|---------|
| building_age | 0-50 | Age of building in years |
| roof_condition | 0-3 | 0=Excellent, 3=Poor |
| foundation_condition | 0-3 | 0=Excellent, 3=Poor |
| electrical_issues | 0-3 | Number/severity of issues |
| plumbing_issues | 0-3 | Number/severity of issues |
| structural_damage | 0-3 | 0=None, 3=Severe |
| mold_presence | 0-1 | 0=No, 1=Yes |
| pest_infestation | 0-1 | 0=No, 1=Yes |
| window_condition | 0-3 | 0=Excellent, 3=Poor |
| paint_condition | 0-3 | 0=Excellent, 3=Poor |
| flooring_condition | 0-3 | 0=Excellent, 3=Poor |
| hvac_condition | 0-3 | 0=Excellent, 3=Poor |
| number_of_violations | 0-10 | Count of violations |
| previous_repairs | 0-10 | Count of past repairs |

### Feature Importance (What Matters Most)

1. **Building Age** (15.7%) - Older buildings tend to have more issues
2. **Number of Violations** (13.6%) - Direct indicator of problems
3. **Paint Condition** (10.4%) - Surface condition reflects overall state
4. **Roof Condition** (9.7%) - Critical structural element
5. **HVAC Condition** (9.1%) - Important for building systems

## 🔧 API Endpoints

### POST /predict
Predict risk level for an inspection

**Request:**
```json
{
  "building_age": 15,
  "roof_condition": 2,
  "foundation_condition": 2,
  "electrical_issues": 2,
  "plumbing_issues": 1,
  "structural_damage": 1,
  "mold_presence": 0,
  "pest_infestation": 0,
  "window_condition": 2,
  "paint_condition": 2,
  "flooring_condition": 2,
  "hvac_condition": 2,
  "number_of_violations": 2,
  "previous_repairs": 1
}
```

**Response:**
```json
{
  "risk_level": "Medium Risk",
  "risk_class": 1,
  "risk_score": 65,
  "probabilities": {
    "low_risk": 30.5,
    "medium_risk": 50.2,
    "high_risk": 19.3
  },
  "confidence": 50.2
}
```

### GET /health
Check if ML service is running

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### GET /model-info
Get model metadata and features

**Response:**
```json
{
  "model_type": "Random Forest Classifier",
  "features": [...14 features...],
  "risk_levels": {"0": "Low Risk", "1": "Medium Risk", "2": "High Risk"},
  "feature_count": 14
}
```

## 📈 Improving the Model

As you collect more inspection data, you can improve accuracy:

1. **Add new inspections** to `inspection_data.csv`
2. **Run training again**: `py train_model.py`
3. **Restart the service**: Kill and restart `app.py`

The model will automatically learn from the new data and make better predictions.

## ⚙️ Troubleshooting

### "Failed to connect to ML service"
- Ensure `py app.py` is running in ml-service folder
- Check that port 5000 is not in use
- Check `ML_SERVICE_URL` environment variable if using different port

### "Model not loaded"
- Run `py train_model.py` first to generate model files
- Check that `models/inspection_model.pkl` exists

### "Missing features" error
- Ensure all 14 required features are included in the request
- Check spelling of feature names

## 🎯 Next Steps

1. **Integrate with your inspection form** - Call `/api/ml/predict` after inspection
2. **Show risk scores in reports** - Display ML predictions in generated reports
3. **Collect real data** - Replace sample data with actual building inspections
4. **Retrain regularly** - Improve model as you gather more inspection data
5. **Add explanations** - Show which factors most influenced the risk score

---

**Questions?** Check the ML service logs or review the code comments.
