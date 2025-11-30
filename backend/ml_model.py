import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

# CORRECTED PATH: Relative to the backend directory where the model lives.
MODEL_PATH = "model.joblib"
FEATURE_ORDER = ['age', 'gender', 'weight', 'cholesterol', 'ap_hi', 'ap_lo', 'smoke', 'active']

def preprocess(df):
    # Fix obvious invalid data
    df = df[df['ap_hi'] >= df['ap_lo']] 
    df = df.drop_duplicates()

    # Ensure numeric features
    for col in FEATURE_ORDER:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    df = df.dropna()
    return df

def train_and_evaluate(csv_path="cardio_train.csv"):
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
        class_weight='balanced',
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
    import joblib, pandas as pd
    
    # Use global constants defined in this file (MODEL_PATH, FEATURE_ORDER)
    model = joblib.load(MODEL_PATH)
    
    # FIX: Create DataFrame from input dict to retain feature names
    input_df = pd.DataFrame([features], columns=FEATURE_ORDER)
    
    # The actual prediction uses the DataFrame
    return float(model.predict_proba(input_df)[0][1])

if __name__ == "__main__":
    train_and_evaluate()