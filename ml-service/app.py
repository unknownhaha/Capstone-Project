from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import traceback

app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = 'models/inspection_model.pkl'
FEATURES_PATH = 'models/feature_names.pkl'

if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
    model = joblib.load(MODEL_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    print("✅ Model loaded successfully")
else:
    model = None
    feature_names = None
    print("⚠️ Model files not found. Train the model first using: python train_model.py")

# Risk level mapping
RISK_LEVELS = {0: 'Low Risk', 1: 'Medium Risk', 2: 'High Risk'}

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict risk level from inspection data
    
    Expected JSON format:
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
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.get_json()
        
        # Validate all required features are present
        missing_features = [f for f in feature_names if f not in data]
        if missing_features:
            return jsonify({
                'error': f'Missing features: {missing_features}'
            }), 400
        
        # Create feature vector in correct order
        features = np.array([[data[f] for f in feature_names]])
        
        # Get prediction
        risk_class = model.predict(features)[0]
        risk_probability = model.predict_proba(features)[0]
        
        # Calculate risk score (0-100)
        max_prob = np.max(risk_probability)
        risk_score = int(max_prob * 100)
        
        return jsonify({
            'risk_level': RISK_LEVELS[risk_class],
            'risk_class': int(risk_class),
            'risk_score': risk_score,
            'probabilities': {
                'low_risk': float(risk_probability[0]) * 100,
                'medium_risk': float(risk_probability[1]) * 100,
                'high_risk': float(risk_probability[2]) * 100
            },
            'confidence': float(max_prob) * 100
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_type': 'Random Forest Classifier',
        'features': feature_names,
        'risk_levels': RISK_LEVELS,
        'feature_count': len(feature_names)
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
