from ml_model import train_and_evaluate

if __name__ == "__main__":
    csv_path = "cardio_train.csv"

    print("Training model from CSV...")
    model = train_and_evaluate(csv_path)
    print("Model trained and saved successfully at 'backend/model.joblib'")
