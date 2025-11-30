import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

MODEL_PATH = "backend/model.joblib"
FEATURE_ORDER = ['age', 'gender', 'weight', 'cholesterol', 'ap_hi', 'ap_lo', 'smoke', 'active']

def preprocess(df):
    # Fix obvious invalid data
    df = df[df['ap_hi'] >= df['ap_lo']]  # systolic >= diastolic
    df = df.drop_duplicates()

    # Ensure numeric features
    for col in FEATURE_ORDER:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    df = df.dropna()
    return df

def train_and_evaluate(csv_path="backend/cardio_train.csv"):
    df = pd.read_csv(csv_path)
    df = preprocess(df)

    target_col = "cardio" if "cardio" in df.columns else ("target" if "target" in df.columns else None)
    if target_col is None:
        raise ValueError("CSV must contain 'cardio' or 'target' column")

    X = df[FEATURE_ORDER]
    y = df[target_col]

    # Stratified split to preserve class balance
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Improved Random Forest
    model = RandomForestClassifier(
        n_estimators=400,
        max_depth=12,
        random_state=42,
        class_weight='balanced',  # handles class imbalance
        min_samples_split=10,
        min_samples_leaf=4,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print("\n=== Model Evaluation ===")
    print(f"Accuracy: {acc:.4f}")
    print("Confusion Matrix:")
    print(cm)

    return model

def predict_risk(features: dict):
    # FEATURE_ORDER and MODEL_PATH are globally available in this file.
    # No need to import them inside the function scope or use 'backend.ml_model' prefix.
    import joblib, numpy as np
    
    model = joblib.load(MODEL_PATH)
    print("Loaded model type:", type(model)) 
    
    arr = np.array([[float(features[k]) for k in FEATURE_ORDER]])
    return float(model.predict_proba(arr)[0][1])

if __name__ == "__main__":
    train_and_evaluate()