import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os

# Load data
df = pd.read_csv('inspection_data.csv')

print("Data loaded:", df.shape)
print("Risk level distribution:\n", df['risk_level'].value_counts())

# Separate features and target
X = df.drop('risk_level', axis=1)
y = df['risk_level']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

print("\nTraining model...")
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy:.2%}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Low Risk', 'Medium Risk', 'High Risk']))

# Save model
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/inspection_model.pkl')
joblib.dump(X.columns.tolist(), 'models/feature_names.pkl')

print("\n✅ Model saved to models/inspection_model.pkl")
print("✅ Feature names saved to models/feature_names.pkl")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("\nFeature Importance:")
print(feature_importance)
