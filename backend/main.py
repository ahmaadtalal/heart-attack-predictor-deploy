from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import os
import pandas as pd
import numpy as np
from collections import Counter
from google.genai import Client

from pydantic import BaseModel
import models, schemas, crud, auth, ml_model

# CORRECTED IMPORTS: Since Render runs the app from the 'backend' directory,
# we use direct imports instead of 'from backend import...' or relative imports.
import models, schemas, crud, auth, ml_model
from database import SessionLocal, engine
from google import genai

# --- Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# --- CORS FIX: Explicitly allowed domains for cross-origin requests ---
# This list MUST include the exact Netlify domain to resolve the CORS block.
NETLIFY_URL = "https://cardiocaree.netlify.app"
RENDER_URL = "https://heart-attack-predictor-deploy.onrender.com"

ALLOWED_ORIGINS = [
    # Local Development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Deployed URLs (REQUIRED for cross-domain calls)
    NETLIFY_URL,
    RENDER_URL,
] 
# ---------------------------------------------------------------------


# Initialize FastAPI app
app = FastAPI(title="Heart Risk App")

# Create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    # Use the explicit list
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ DB Dependency ------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------ ML/Data Preprocessing Functions ------------------

def preprocess_cardio_data(df):
    """
    Comprehensive preprocessing for cardiovascular dataset
    Converts categorical codes to meaningful real-life values
    """
    # Create a copy to avoid modifying original
    df = df.copy()
    
    # Drop 'id' if present
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
    
    # 1. AGE: Convert from days to years
    df['age'] = (df['age'] / 365).round(1)
    
    # 2. GENDER: Convert to meaningful labels
    df['gender_label'] = df['gender'].map({
        1: "Female",
        2: "Male"
    })
    
    # 3. HEIGHT & WEIGHT: Remove outliers
    df = df[(df['height'] >= 140) & (df['height'] <= 220)]
    df = df[(df['weight'] >= 30) & (df['weight'] <= 200)]
    
    # Calculate BMI for additional insight
    df['bmi'] = (df['weight'] / ((df['height'] / 100) ** 2)).round(1)
    df['bmi_category'] = pd.cut(df['bmi'], 
                                 bins=[0, 18.5, 25, 30, 100],
                                 labels=['Underweight', 'Normal', 'Overweight', 'Obese'])
    
    # 4. BLOOD PRESSURE: Remove invalid values and create categories
    df = df[(df['ap_hi'] >= 80) & (df['ap_hi'] <= 250)]
    df = df[(df['ap_lo'] >= 40) & (df['ap_lo'] <= 150)]
    df = df[df['ap_hi'] > df['ap_lo']]
    
    def categorize_bp(row):
        if row['ap_hi'] < 120 and row['ap_lo'] < 80:
            return 'Normal'
        elif row['ap_hi'] < 130 and row['ap_lo'] < 80:
            return 'Elevated'
        elif row['ap_hi'] < 140 or row['ap_lo'] < 90:
            return 'High BP Stage 1'
        elif row['ap_hi'] < 180 or row['ap_lo'] < 120:
            return 'High BP Stage 2'
        else:
            return 'Hypertensive Crisis'
    
    df['bp_category'] = df.apply(categorize_bp, axis=1)
    
    # 5. CHOLESTEROL
    df['cholesterol_value'] = df['cholesterol'].map({1: 170, 2: 220, 3: 260})
    df['cholesterol_label'] = df['cholesterol'].map({1: 'Normal (<200 mg/dL)', 2: 'Borderline High (200-239 mg/dL)', 3: 'High (≥240 mg/dL)'})
    
    # 6. GLUCOSE
    df['glucose_value'] = df['gluc'].map({1: 90, 2: 110, 3: 150})
    df['glucose_label'] = df['gluc'].map({1: 'Normal (<100 mg/dL)', 2: 'Prediabetes (100-125 mg/dL)', 3: 'Diabetes Range (≥126 mg/dL)'})
    
    # 7. LIFESTYLE FACTORS
    df['smoking_status'] = df['smoke'].map({0: 'Non-Smoker', 1: 'Smoker'})
    df['alcohol_status'] = df['alco'].map({0: 'No Alcohol', 1: 'Consumes Alcohol'})
    df['activity_status'] = df['active'].map({0: 'Inactive', 1: 'Active'})
    
    # 8. CARDIO (Target)
    df['cardio_status'] = df['cardio'].map({0: 'No Disease', 1: 'Has Disease'})
    df['risk_percentage'] = df['cardio'].astype(float) * 100
    
    def categorize_risk(r):
        if r > 70: return "High"
        elif r > 40: return "Moderate"
        else: return "Low"
    
    df['risk_category'] = df['risk_percentage'].apply(categorize_risk)
    df['age_group'] = pd.cut(df['age'], bins=[0, 40, 50, 60, 100], labels=['Under 40', '40-50', '50-60', '60+'])
    
    return df

# ------------------ Routes ------------------

# Register
@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print("Received registration request:", user)
    
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = crud.create_user(db, user)
    return created_user

# Login (Token)
@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # form_data.username contains the email in our frontend
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_medic": user.is_medic,
        "user_id": user.id,
        "name": user.name
    }

@app.post("/evaluate")
def evaluate(eval_in: schemas.EvalIn,
             current_user: models.User = Depends(auth.get_current_user),
             db: Session = Depends(get_db)):
    
    if current_user.is_medic:
        raise HTTPException(status_code=403, detail="Medics cannot submit evaluations")

    entry = crud.create_evaluation(db, current_user.id, eval_in)
    rec = "Low risk — maintain healthy lifestyle."
    if entry.risk > 0.7:
        rec = "High risk — consult a doctor immediately."
    elif entry.risk > 0.4:
        rec = "Moderate risk — increase exercise, monitor BP and cholesterol."

    return {"risk": entry.risk, "recommendation": rec, "id": entry.id}

@app.get("/history")
def get_history(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1️⃣ Current user evaluations
    evaluations = crud.get_evaluations_for_user(db, current_user.id)

    user_result = [
        {
            "id": e.id,
            "age": e.age,
            "gender": e.gender,
            "weight": e.weight,
            "cholesterol": e.cholesterol,
            "ap_hi": e.ap_hi,
            "ap_lo": e.ap_lo,
            "smoke": e.smoke,
            "active": e.active,
            "risk": e.risk,
            "date": e.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for e in evaluations
    ]

    # 2️⃣ Latest evaluation for all users
    all_users_latest = []
    users = db.query(models.User).all()
    for user in users:
        latest_eval = (
            db.query(models.Evaluation)
            .filter(models.Evaluation.user_id == user.id)
            .order_by(models.Evaluation.created_at.desc())
            .first()
        )
        if latest_eval:
            all_users_latest.append({
                "cholesterol": latest_eval.cholesterol,
                "ap_hi": latest_eval.ap_hi,
                "ap_lo": latest_eval.ap_lo
            })

    return {
        "userHistory": user_result,
        "allUsersLatest": all_users_latest
    }




@app.get("/dashboard-analysis")
def dashboard_analysis():
    # Load dataset. The path is relative to the backend directory on Render.
    BASE_DIR = os.path.dirname(__file__)
    csv_path = os.path.join(BASE_DIR, "cardio_train.csv")

    df = pd.read_csv(csv_path)
    
    # Preprocess dataset with comprehensive cleaning
    df = preprocess_cardio_data(df)
    
    # --- Line chart: Risk by Age (separate lines for Male and Female) ---
    age_range = np.arange(df['age'].min(), df['age'].max() + 1)
    line_data_female = []
    line_data_male = []
    
    for age in age_range:
        # Female data
        subset_female = df[(df['age'] == age) & (df['gender_label'] == 'Female')]
        if not subset_female.empty:
            disease_rate = (subset_female['cardio'].sum() / len(subset_female)) * 100
            line_data_female.append({
                "age": float(age),
                "risk_percentage": float(disease_rate),
                "count": len(subset_female)
            })
        
        # Male data
        subset_male = df[(df['age'] == age) & (df['gender_label'] == 'Male')]
        if not subset_male.empty:
            disease_rate = (subset_male['cardio'].sum() / len(subset_male)) * 100
            line_data_male.append({
                "age": float(age),
                "risk_percentage": float(disease_rate),
                "count": len(subset_male)
            })
    
    line_data = {"Female": line_data_female, "Male": line_data_male}
    
    # --- Pie chart: Risk distribution by Gender ---
    gender_risk = []
    for gender in ['Female', 'Male']:
        subset = df[df['gender_label'] == gender]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = subset.shape[0]
            risk_percentage = (disease_count / total_count) * 100
            gender_risk.append({
                "gender_label": gender,
                "risk_percentage": float(risk_percentage),
                "disease_count": int(disease_count),
                "total_count": int(total_count)
            })
    
    # --- Bar charts: Average feature VALUES per gender (for patients WITH disease) ---
    bar_data = {}
    for gender in ['Female', 'Male']:
        subset = df[(df['gender_label'] == gender) & (df['cardio'] == 1)]
        if not subset.empty:
            bar_data[gender] = [
                {"feature": "BMI", "value": float(subset['bmi'].mean()), "unit": "kg/m²"},
                {"feature": "Systolic BP", "value": float(subset['ap_hi'].mean()), "unit": "mmHg"},
                {"feature": "Diastolic BP", "value": float(subset['ap_lo'].mean()), "unit": "mmHg"},
                {"feature": "Cholesterol", "value": float(subset['cholesterol_value'].mean()), "unit": "mg/dL"},
                {"feature": "Glucose", "value": float(subset['glucose_value'].mean()), "unit": "mg/dL"},
                {"feature": "Age", "value": float(subset['age'].mean()), "unit": "years"},
                {"feature": "Smokers", "value": float((subset['smoke'].sum() / len(subset)) * 100), "unit": "%"},
                {"feature": "Alcohol Users", "value": float((subset['alco'].sum() / len(subset)) * 100), "unit": "%"},
                {"feature": "Physically Active", "value": float((subset['active'].sum() / len(subset)) * 100), "unit": "%"}
            ]
        else:
            bar_data[gender] = []
    
    # --- Risk category distribution ---
    risk_summary = dict(Counter(df['risk_category']))
    
    # --- NEW: Age Group Analysis ---
    age_group_analysis = []
    for age_group in ['Under 40', '40-50', '50-60', '60+']:
        subset = df[df['age_group'] == age_group]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = len(subset)
            age_group_analysis.append({
                "age_group": age_group,
                "disease_percentage": float((disease_count / total_count) * 100),
                "total_patients": int(total_count),
                "diseased_patients": int(disease_count)
            })
    
    # --- NEW: BMI Category Distribution ---
    bmi_distribution = []
    for bmi_cat in ['Underweight', 'Normal', 'Overweight', 'Obese']:
        subset = df[df['bmi_category'] == bmi_cat]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = len(subset)
            bmi_distribution.append({
                "bmi_category": bmi_cat,
                "disease_percentage": float((disease_count / total_count) * 100),
                "total_patients": int(total_count),
                "diseased_patients": int(disease_count)
            })
    
    # --- NEW: Blood Pressure Category Analysis ---
    bp_analysis = []
    bp_categories = ['Normal', 'Elevated', 'High BP Stage 1', 'High BP Stage 2', 'Hypertensive Crisis']
    for bp_cat in bp_categories:
        subset = df[df['bp_category'] == bp_cat]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = len(subset)
            bp_analysis.append({
                "bp_category": bp_cat,
                "disease_percentage": float((disease_count / total_count) * 100),
                "total_patients": int(total_count),
                "diseased_patients": int(disease_count)
            })
    
    # --- NEW: Lifestyle Factors Impact ---
    lifestyle_impact = {}

    # Smoking
    smokers = df[df['smoke'] == 1]
    non_smokers = df[df['smoke'] == 0]
    lifestyle_impact['smoking'] = {
        "smokers_disease_rate": float((smokers['cardio'].sum() / len(smokers)) * 100) if len(smokers) > 0 else 0,
        "non_smokers_disease_rate": float((non_smokers['cardio'].sum() / len(non_smokers)) * 100) if len(non_smokers) > 0 else 0
    }

    # Alcohol
    drinkers = df[df['alco'] == 1]
    non_drinkers = df[df['alco'] == 0]
    lifestyle_impact['alcohol'] = {
        "drinkers_disease_rate": float((drinkers['cardio'].sum() / len(drinkers)) * 100) if len(drinkers) > 0 else 0,
        "non_drinkers_disease_rate": float((non_drinkers['cardio'].sum() / len(non_drinkers)) * 100) if len(non_drinkers) > 0 else 0
    }

    # Physical Activity
    active = df[df['active'] == 1]
    inactive = df[df['active'] == 0]
    lifestyle_impact['physical_activity'] = {
        "active_disease_rate": float((active['cardio'].sum() / len(active)) * 100) if len(active) > 0 else 0,
        "inactive_disease_rate": float((inactive['cardio'].sum() / len(inactive)) * 100) if len(inactive) > 0 else 0
    }
    
    # --- NEW: Cholesterol & Glucose Analysis ---
    cholesterol_analysis = []
    for chol_level in [1, 2, 3]:
        subset = df[df['cholesterol'] == chol_level]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = len(subset)
            cholesterol_analysis.append({
                "level": int(chol_level),
                "label": subset['cholesterol_label'].iloc[0],
                "disease_percentage": float((disease_count / total_count) * 100),
                "total_patients": int(total_count)
            })
    
    glucose_analysis = []
    for gluc_level in [1, 2, 3]:
        subset = df[df['gluc'] == gluc_level]
        if not subset.empty:
            disease_count = subset[subset['cardio'] == 1].shape[0]
            total_count = len(subset)
            glucose_analysis.append({
                "level": int(gluc_level),
                "label": subset['glucose_label'].iloc[0],
                "disease_percentage": float((disease_count / total_count) * 100),
                "total_patients": int(total_count)
            })
    
    # --- NEW: High-Risk Profile (patients with multiple risk factors) ---
    high_risk_profile = df[
        (df['cholesterol'] >= 2) |
        (df['gluc'] >= 2) |
        (df['bp_category'].isin(['High BP Stage 2', 'Hypertensive Crisis'])) |
        (df['bmi'] >= 30) |
        (df['smoke'] == 1)
    ]
    high_risk_stats = {
        "total_high_risk": int(high_risk_profile.shape[0]),
        "high_risk_percentage": float((high_risk_profile.shape[0] / len(df)) * 100),
        "disease_rate_in_high_risk": float((high_risk_profile['cardio'].sum() / len(high_risk_profile)) * 100) if len(high_risk_profile) > 0 else 0
    }
    
    # --- Additional statistics ---
    stats = {
        "total_patients": int(df.shape[0]),
        "avg_age": float(df['age'].mean()),
        "disease_prevalence_percentage": float((df['cardio'].sum() / len(df)) * 100),
        "avg_bmi": float(df['bmi'].mean()),
        "high_bp_percentage": float((df['bp_category'].isin(['High BP Stage 1', 'High BP Stage 2', 'Hypertensive Crisis']).sum() / len(df)) * 100)
    }
    
    return {
        "line_data": line_data,
        "gender_risk": gender_risk,
        "bar_data": bar_data,
        "risk_summary": risk_summary,
        "statistics": stats,
        # New comprehensive analytics
        "age_group_analysis": age_group_analysis,
        "bmi_distribution": bmi_distribution,
        "bp_analysis": bp_analysis,
        "lifestyle_impact": lifestyle_impact,
        "cholesterol_analysis": cholesterol_analysis,
        "glucose_analysis": glucose_analysis,
        "high_risk_profile": high_risk_stats
        
    }
    
@app.get("/medic-dashboard")
def medic_dashboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1️⃣ Ensure current user is medic
    if not current_user.is_medic:
        return {"detail": "Access denied"}, 403

    # 2️⃣ Fetch all users
    users = db.query(models.User).all()
    total_users = len(users)

    all_users_latest = []
    high_risk_count = 0
    smoking_count = 0
    active_count = 0

    for user in users:
        latest_eval = (
            db.query(models.Evaluation)
            .filter(models.Evaluation.user_id == user.id)
            .order_by(models.Evaluation.created_at.desc())
            .first()
        )
        if latest_eval:
            all_users_latest.append(latest_eval)
            if latest_eval.risk >= 0.5:  # example threshold for high risk
                high_risk_count += 1
            if latest_eval.smoke:
                smoking_count += 1
            if latest_eval.active:
                active_count += 1

    # 3️⃣ Prepare chart data
    risk_percentages = {"Low": 0, "Medium": 0, "High": 0}
    gender_percentages = {"Male": 0, "Female": 0}
    bp_percentages = {"Normal": 0, "Prehypertension": 0, "Hypertension": 0}
    cholesterol_percentages = {}
    bmi_percentages = {}

    for e in all_users_latest:
        # Risk
        risk_val = e.risk * 100
        if risk_val < 20:
            risk_percentages["Low"] += 1
        elif 20 <= risk_val <= 50:
            risk_percentages["Medium"] += 1
        else:
            risk_percentages["High"] += 1

        # Gender
        gender_percentages["Male" if e.gender == 1 else "Female"] += 1

        # BP
        if e.ap_hi < 120 and e.ap_lo < 80:
            bp_percentages["Normal"] += 1
        elif 120 <= e.ap_hi < 140 or 80 <= e.ap_lo < 90:
            bp_percentages["Prehypertension"] += 1
        else:
            bp_percentages["Hypertension"] += 1

        # Cholesterol
        chol_level = e.cholesterol
        cholesterol_percentages[str(chol_level)] = cholesterol_percentages.get(str(chol_level), 0) + 1

        # BMI
        # bmi_percentages[str(round(e.weight / ((e.height/100)**2), 1))] = bmi_percentages.get(str(round(e.weight / ((e.height/100)**2), 1)), 0) + 1

    # Convert counts to percentages
    def to_percentages(d):
        total = sum(d.values())
        return {k: round(v / total * 100, 1) for k, v in d.items()}

    return {
        "total_users": total_users,
        "high_risk_percentage": round(high_risk_count / total_users * 100, 1),
        "smoking_percentage": round(smoking_count / total_users * 100, 1),
        "active_percentage": round(active_count / total_users * 100, 1),
        "risk_percentages": to_percentages(risk_percentages),
        "gender_percentages": to_percentages(gender_percentages),
        "bp_percentages": to_percentages(bp_percentages),
        "cholesterol_percentages": to_percentages(cholesterol_percentages),
        "bmi_percentages": to_percentages(bmi_percentages),
        "latest_evals": [
            {
                "id": e.id,
                "name": e.user.name,
                "age": e.age,
                "gender": e.gender,
                "weight": e.weight,
                "cholesterol": e.cholesterol,
                "ap_hi": e.ap_hi,
                "ap_lo": e.ap_lo,
                "smoke": e.smoke,
                "active": e.active,
                "risk": e.risk,
                "date": e.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for e in all_users_latest
        ],
    }

# ------------------ Gemini Chat ------------------

class ChatRequest(BaseModel):
    message: str

if not GEMINI_API_KEY:
    # If key is missing, handle gracefully by printing a warning and setting client to None
    print("Warning: GEMINI_API_KEY environment variable is not set. Chatbot functionality will be disabled.")
    client = None
else:
    client = genai.Client(api_key=GEMINI_API_KEY)

@app.post("/chat")
def chat(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=503, detail="Chatbot service unavailable (API Key Missing)")
        
    try:
        # Use Google Search for grounded results
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=request.message,
        )
        # Assuming you want to display the generated text
        return {"answer": response.text}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Return a user-friendly error message
        raise HTTPException(status_code=500, detail="Internal Chatbot Error processing request.")