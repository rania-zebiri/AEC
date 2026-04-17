import os
import pandas as pd
import xgboost as xgb
import re
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def clean_numeric(series):
    """Converts Algerian formatted strings (comma for decimal, spaces) to floats."""
    return pd.to_numeric(
        series.astype(str)
              .str.replace(r'\s+', '', regex=True) # Remove spaces
              .str.replace(',', '.')               # Replace comma with dot
              , errors='coerce'
    ).fillna(0)

def run_real_data_test():
    print("🚀 LOADING AND CLEANING REAL CATNAT DATA (2023-2025)...")
    
    files = [
        'CATNAT_2023_2025.xlsx - 2023.csv',
        'CATNAT_2023_2025.xlsx - 2024.csv',
        'CATNAT_2023_2025.xlsx - 2025.csv'
    ]
    
    data_frames = []
    for f in files:
        if not os.path.exists(f):
            print(f"⚠️ Missing: {f}")
            continue
        
        temp_df = pd.read_csv(f)
        
        # CLEANING NUMERIC COLUMNS
        temp_df['PRIME_NETTE'] = clean_numeric(temp_df['PRIME_NETTE'])
        temp_df['CAPITAL_ASSURE'] = clean_numeric(temp_df['CAPITAL_ASSURE'])
        
        data_frames.append(temp_df)
        
    df = pd.concat(data_frames, ignore_index=True)

    # 1. Cleaning Geo Names
    def clean_geo(text):
        match = re.search(r'-\s*(.*)', str(text))
        return match.group(1).strip().upper() if match else str(text).strip().upper()

    df['WILAYA_CLEAN'] = df['WILAYA'].apply(clean_geo)

    # 2. Create Target (Risk Tier)
    # We avoid division by zero
    df = df[df['CAPITAL_ASSURE'] > 0].copy()
    df['ratio'] = df['PRIME_NETTE'] / df['CAPITAL_ASSURE']
    
    threshold = df['ratio'].median()
    df['is_high_risk'] = (df['ratio'] > threshold).astype(int)

    # 3. Prepare AI Features
    le = LabelEncoder()
    df['wilaya_enc'] = le.fit_transform(df['WILAYA_CLEAN'])
    
    X = df[['wilaya_enc', 'CAPITAL_ASSURE']]
    y = df['is_high_risk']

    # 4. Split and Train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("🧠 Training XGBoost Model...")
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)

    # 5. Results
    y_pred = model.predict(X_test)
    
    print("\n📊 MODEL PERFORMANCE REPORT")
    print("-" * 30)
    print(f"Overall Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print("\nDetailed Metrics:")
    print(classification_report(y_test, y_pred))

if __name__ == "__main__":
    run_real_data_test()