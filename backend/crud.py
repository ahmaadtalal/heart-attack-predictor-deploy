from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models, schemas
import ml_model

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # truncate password to 72 bytes (bcrypt limit)
    safe_password = user.password[:72]
    hashed_pw = pwd_context.hash(safe_password)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pw,
        is_medic=user.is_medic
    )
    db.add(db_user)
    print("Before commit")
    db.commit()
    print("After commit")

    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

def create_evaluation(db: Session, user_id: int, eval_in: schemas.EvalIn):
    features = eval_in.dict()
    age_in_days = features["age"] * 365
    features_for_model = {
        "age": age_in_days,
        "gender": features["gender"],
        "weight": features["weight"],
        "cholesterol": features["cholesterol"],
        "ap_hi": features["ap_hi"],
        "ap_lo": features["ap_lo"],
        "smoke": bool(features["smoke"]),
        "active": bool(features["active"]),
    }
    risk = ml_model.predict_risk(features_for_model)
    entry = models.Evaluation(user_id=user_id, **features_for_model, risk=risk)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_evaluations_for_user(db: Session, user_id: int):
    return db.query(models.Evaluation).filter(models.Evaluation.user_id == user_id).all()

def get_all_users_with_evals(db: Session):
    users = db.query(models.User).all()
    result = []
    for u in users:
        evals = get_evaluations_for_user(db, u.id)
        result.append({
            "user": {"id": u.id, "name": u.name, "email": u.email},
            "evaluations": [e.risk for e in evals]
        })
    return result
