import os
import pandas as pd
import xgboost as xgb
import re
import joblib  # <--- Essential for saving
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

def clean_numeric(series):
    return pd.to_numeric(
        series.astype(str)
              .str.replace(r'\s+', '', regex=True)
              .str.replace(',', '.')
              , errors='coerce'
    ).fillna(0)

def run_real_data_test():
    print("🚀 LOADING AND CLEANING REAL CATNAT DATA (2023-2025)...")
    
    # Check if we are in the right folder or need to look in data/
    files = [
        'CATNAT_2023_2025.xlsx - 2023.csv',
        'CATNAT_2023_2025.xlsx - 2024.csv',
        'CATNAT_2023_2025.xlsx - 2025.csv'
    ]
    
    data_frames = []
    for f in files:
        if not os.path.exists(f):
            print(f"⚠️ Missing file: {f}")
            continue
        
        temp_df = pd.read_csv(f)
        temp_df['PRIME_NETTE'] = clean_numeric(temp_df['PRIME_NETTE'])
        temp_df['CAPITAL_ASSURE'] = clean_numeric(temp_df['CAPITAL_ASSURE'])
        data_frames.append(temp_df)
        
    if not data_frames:
        print("❌ No data found! Make sure CSVs are in the AEC folder.")
        return

    df = pd.concat(data_frames, ignore_index=True)

    # Clean Wilaya Names
    df['WILAYA_CLEAN'] = df['WILAYA'].apply(lambda x: re.search(r'-\s*(.*)', str(x)).group(1).strip().upper() if '-' in str(x) else str(x).strip().upper())

    # Create Target
    df = df[df['CAPITAL_ASSURE'] > 0].copy()
    df['ratio'] = df['PRIME_NETTE'] / df['CAPITAL_ASSURE']
    threshold = df['ratio'].median()
    df['is_high_risk'] = (df['ratio'] > threshold).astype(int)

    # Encode
    le = LabelEncoder()
    df['wilaya_enc'] = le.fit_transform(df['WILAYA_CLEAN'])
    
    X = df[['wilaya_enc', 'CAPITAL_ASSURE']]
    y = df['is_high_risk']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("🧠 Training XGBoost Model...")
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)

    # Results
    y_pred = model.predict(X_test)
    print(f"\n✅ Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")

    # --- SAVING THE BRAIN ---
    model_path = "seismic_risk_ai/core/models/catnat_xgb_model.json"
    encoder_path = "seismic_risk_ai/core/models/wilaya_encoder.joblib"
    
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save_model(model_path)
    joblib.dump(le, encoder_path)

    print(f"\n💾 EXPORT SUCCESSFUL")
    print(f"1. Model saved to: {model_path}")
    print(f"2. Encoder saved to: {encoder_path}")

if __name__ == "__main__":
    run_real_data_test()