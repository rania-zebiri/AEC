import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import os
import numpy as np
import re

# 1. Load your 3 years of data
base_path = '/Users/macbook/AEC/seismic-risk-backend/csv_data/'

files = [
    base_path + 'CATNAT_2023_2025.xlsx - 2023.csv',
    base_path + 'CATNAT_2023_2025.xlsx - 2024.csv',
    base_path + 'CATNAT_2023_2025.xlsx - 2025.csv'
]

# Vérifier les fichiers
for f in files:
    if os.path.exists(f):
        print(f"✅ Fichier trouvé: {f}")
    else:
        print(f"❌ Fichier non trouvé: {f}")

# Charger les fichiers
dfs = []
for f in files:
    if os.path.exists(f):
        df_temp = pd.read_csv(f)
        print(f"   - {os.path.basename(f)}: {len(df_temp)} lignes, colonnes: {list(df_temp.columns)}")
        dfs.append(df_temp)

df = pd.concat(dfs, ignore_index=True)

print(f"\n📊 Total lignes chargées: {len(df)}")

# === CORRECTION: Convertir les colonnes en nombres ===
def clean_number(x):
    """Nettoie et convertit une chaîne en nombre"""
    if pd.isna(x):
        return 0
    if isinstance(x, (int, float)):
        return float(x)
    # Convertir en string et nettoyer
    s = str(x).strip()
    # Remplacer les virgules par des points
    s = s.replace(',', '.')
    # Supprimer les espaces
    s = s.replace(' ', '')
    # Supprimer les caractères non numériques sauf le point
    s = re.sub(r'[^0-9.-]', '', s)
    try:
        return float(s)
    except:
        return 0

# Appliquer le nettoyage
print("\n🔧 Nettoyage des données...")

if 'PRIME_NETTE' in df.columns:
    df['PRIME_NETTE'] = df['PRIME_NETTE'].apply(clean_number)
    print(f"   - PRIME_NETTE: {df['PRIME_NETTE'].dtype}, min={df['PRIME_NETTE'].min():.2f}, max={df['PRIME_NETTE'].max():.2f}")

if 'CAPITAL_ASSURE' in df.columns:
    df['CAPITAL_ASSURE'] = df['CAPITAL_ASSURE'].apply(clean_number)
    print(f"   - CAPITAL_ASSURE: {df['CAPITAL_ASSURE'].dtype}, min={df['CAPITAL_ASSURE'].min():.2f}, max={df['CAPITAL_ASSURE'].max():.2f}")

# Supprimer les lignes avec des valeurs nulles ou nulles
df = df[(df['CAPITAL_ASSURE'] > 0) & (df['PRIME_NETTE'] > 0)]
print(f"\n📊 Après suppression des valeurs invalides: {len(df)} lignes")

# 2. Clean the Algerian strings (Fixes "16 - ALGER" issues)
if 'WILAYA' in df.columns:
    df['WILAYA'] = df['WILAYA'].astype(str).str.replace(r'^\d+\s*-\s*', '', regex=True).str.strip().str.upper()
    print(f"\n📊 Wilayas uniques: {df['WILAYA'].nunique()}")

# 3. Create the 'Target' (Risk Tier)
# We define High Risk as any policy with a premium ratio > 0.0012
df['premium_ratio'] = df['PRIME_NETTE'] / df['CAPITAL_ASSURE']
df['risk_tier'] = (df['premium_ratio'] > 0.0012).astype(int)

print(f"\n📊 Distribution des risques:")
print(f"   - Low Risk (0): {(df['risk_tier'] == 0).sum()} contrats")
print(f"   - High Risk (1): {(df['risk_tier'] == 1).sum()} contrats")
print(f"   - Premium ratio moyen: {df['premium_ratio'].mean():.6f}")

# 4. Encode text for the AI
le_wilaya = LabelEncoder()
df['wilaya_encoded'] = le_wilaya.fit_transform(df['WILAYA'])

# 5. Train XGBoost
X = df[['wilaya_encoded', 'CAPITAL_ASSURE']]
y = df['risk_tier']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"\n🔧 Entraînement du modèle XGBoost...")
print(f"   - Training samples: {len(X_train)}")
print(f"   - Test samples: {len(X_test)}")

model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=4,
    learning_rate=0.1,
    random_state=42,
    use_label_encoder=False,
    eval_metric='logloss'
)
model.fit(X_train, y_train)

# 6. Check Accuracy
preds = model.predict(X_test)
accuracy = accuracy_score(y_test, preds) * 100

print(f"\n✅ XGBoost Accuracy: {accuracy:.2f}%")
print("\n📊 Classification Report:")
print(classification_report(y_test, preds, target_names=['Low Risk', 'High Risk']))

# 7. Sauvegarder le modèle
import joblib

model_path = '/Users/macbook/AEC/seismic-risk-backend/app/data/ai_models/'
os.makedirs(model_path, exist_ok=True)

model.save_model(model_path + 'xgboost_model.json')
joblib.dump(le_wilaya, model_path + 'label_encoder.pkl')

print(f"\n✅ Modèle sauvegardé dans: {model_path}")
print(f"   - Modèle: xgboost_model.json")
print(f"   - Encodeur: label_encoder.pkl")

# 8. Tester le modèle
print("\n🧪 Test du modèle avec exemples:")
test_cases = [
    {"wilaya": "ALGER", "capital": 50000000},
    {"wilaya": "BLIDA", "capital": 100000000},
    {"wilaya": "ORAN", "capital": 75000000},
    {"wilaya": "ADRAR", "capital": 50000000},
    {"wilaya": "TAMANRASSET", "capital": 20000000},
]

for test in test_cases:
    try:
        wilaya_encoded = le_wilaya.transform([test["wilaya"]])[0]
        X_test_sample = [[wilaya_encoded, test["capital"]]]
        pred = model.predict(X_test_sample)[0]
        proba = model.predict_proba(X_test_sample)[0]
        
        risk_label = "🔴 HIGH RISK" if pred == 1 else "🟢 LOW RISK"
        print(f"\n   📍 {test['wilaya']} - Capital: {test['capital']:,.0f} DZD")
        print(f"      Prédiction: {risk_label}")
        print(f"      Probabilité High Risk: {proba[1]*100:.1f}%")
    except Exception as e:
        print(f"\n   ⚠️ Wilaya '{test['wilaya']}' non trouvée dans les données d'entraînement")

print("\n" + "="*50)
print("   TRAINING COMPLETED!")
print("="*50)