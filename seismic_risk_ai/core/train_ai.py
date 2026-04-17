import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# 1. Load your 3 years of data
files = ['CATNAT_2023_2025.xlsx - 2023.csv', 'CATNAT_2023_2025.xlsx - 2024.csv', 'CATNAT_2023_2025.xlsx - 2025.csv']
df = pd.concat([pd.read_csv(f) for f in files])

# 2. Clean the Algerian strings (Fixes "16 - ALGER" issues)
df['WILAYA'] = df['WILAYA'].str.replace(r'^\d+\s*-\s*', '', regex=True).str.strip()

# 3. Create the 'Target' (Risk Tier)
# We define High Risk as any policy with a premium ratio > 0.0012
df['premium_ratio'] = df['PRIME_NETTE'] / df['CAPITAL_ASSURE']
df['risk_tier'] = (df['premium_ratio'] > 0.0012).astype(int) 

# 4. Encode text for the AI
le_wilaya = LabelEncoder()
df['wilaya_encoded'] = le_wilaya.fit_transform(df['WILAYA'])

# 5. Train XGBoost
X = df[['wilaya_encoded', 'CAPITAL_ASSURE']]
y = df['risk_tier']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = xgb.XGBClassifier()
model.fit(X_train, y_train)

# 6. Check Accuracy
preds = model.predict(X_test)
print(f"✅ XGBoost Accuracy: {accuracy_score(y_test, preds) * 100:.2f}%")
print(classification_report(y_test, preds))