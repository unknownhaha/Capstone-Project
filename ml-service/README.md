# ML Service - Building Risk Assessment

This is the machine learning backend for your building inspection app.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation & Setup

```bash
cd ml-service

# 1. Create a virtual environment (recommended — fixes Pylance import warnings)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the model (generates models/ folder)
python train_model.py

# 4. Start the Flask API server
python app.py
```

**Cursor / VS Code:** Select the interpreter  
`ml-service/.venv/Scripts/python.exe` (Windows) or `ml-service/.venv/bin/python` (Mac/Linux)  
so Pylance resolves `pandas`, `numpy`, `sklearn`, and `joblib`.

Server will be available at: **http://localhost:5000**

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### Get Model Info
```bash
curl http://localhost:5000/model-info
```

### Make Prediction
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Response:
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

## 📊 Model Details

**Type:** Random Forest Classifier
- 100 trees
- Max depth: 10
- Trained on: 25 building inspections
- Features: 14 inspection metrics
- Classes: 3 risk levels (Low, Medium, High)

**Accuracy:** 100% on test set

## 📈 Improving the Model

1. **Collect more inspection data** and add to `inspection_data.csv`
2. **Run training:** `python train_model.py`
3. **Restart server:** Stop and restart `python app.py`

The model learns from new data automatically.

## 🗂️ File Structure

```
ml-service/
├── app.py                    # Flask API server
├── train_model.py            # Model training script
├── inspection_data.csv       # Training dataset
├── requirements.txt          # Python dependencies
└── models/                   # Generated after training
    ├── inspection_model.pkl  # Trained model
    └── feature_names.pkl     # Feature column names
```

## 🔧 Configuration

### Change Server Port
Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=YOUR_PORT)
```

### Change Model Parameters
Edit `train_model.py`:
```python
model = RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=10,          # Max tree depth
    min_samples_split=5,   # Min samples to split
    # ... other parameters
)
```

## 🧪 Testing

### Test with Python
```python
import requests
import json

data = {
    "building_age": 15,
    # ... 13 more features
}

response = requests.post('http://localhost:5000/predict', json=data)
print(response.json())
```

### Test with your Next.js app
Visit: `http://localhost:3000/ml-test`

## 📚 Dependencies

- **pandas** - Data manipulation
- **numpy** - Numerical computing
- **scikit-learn** - Machine learning
- **Flask** - REST API server
- **Flask-CORS** - Cross-origin requests
- **joblib** - Model serialization

## ⚠️ Troubleshooting

### Port 5000 already in use
```bash
# Find and kill process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Model files missing
Run `python train_model.py` first

### CORS errors
Check that `Flask-CORS` is installed and `CORS(app)` is called in `app.py`

## 🚢 Production Deployment

For production, use a WSGI server like Gunicorn:

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

**Questions?** Check the logs or review the code comments in `app.py` and `train_model.py`.
