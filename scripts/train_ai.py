import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

# ─────────────────────────────────────────────
# 1. LOAD DATA
# ─────────────────────────────────────────────
files = [
    "data/CATNAT_2023_2025.xlsx - 2023.csv",
    "data/CATNAT_2023_2025.xlsx - 2024.csv",
    "data/CATNAT_2023_2025.xlsx - 2025.csv",
]

df_list = []
for f in files:
    try:
        temp_df = pd.read_csv(f, decimal=',')
        df_list.append(temp_df)
        print(f"✅ Loaded: {f}  ({len(temp_df):,} rows)")
    except FileNotFoundError:
        print(f"⚠️  Warning: File not found → {f}")

df = pd.concat(df_list, ignore_index=True)
print(f"\n📦 Total rows after merge: {len(df):,}")

# ─────────────────────────────────────────────
# 2. CLEANING & TYPE CONVERSION
# ─────────────────────────────────────────────
df['PRIME_NETTE']    = pd.to_numeric(df['PRIME_NETTE'],    errors='coerce')
df['CAPITAL_ASSURE'] = pd.to_numeric(df['CAPITAL_ASSURE'], errors='coerce')
df['WILAYA']         = (df['WILAYA'].astype(str)
                          .str.replace(r'^\d+\s*-\s*', '', regex=True)
                          .str.strip())

for col in ['COMMUNE', 'USAGE', 'GARANTIE', 'TYPE_CONTRAT']:
    if col in df.columns:
        df[col] = df[col].fillna('Unknown').astype(str).str.strip()

df = df.dropna(subset=['PRIME_NETTE', 'CAPITAL_ASSURE', 'WILAYA'])
df = df[df['CAPITAL_ASSURE'] > 0]
print(f"📦 Rows after cleaning:      {len(df):,}")

# ─────────────────────────────────────────────
# 3. TARGET CREATION  (data-driven threshold)
# ─────────────────────────────────────────────
df['premium_ratio'] = df['PRIME_NETTE'] / df['CAPITAL_ASSURE']

threshold = df['premium_ratio'].median()
df['risk_tier'] = (df['premium_ratio'] > threshold).astype(int)

print(f"\n🎯 Threshold (median): {threshold:.6f}")
print(df['risk_tier'].value_counts(normalize=True).rename({0: 'Low risk', 1: 'High risk'}))

# ─────────────────────────────────────────────
# 4. FEATURE ENGINEERING
# ─────────────────────────────────────────────
# FIX 1: clip(lower=0) prevents the RuntimeWarning from negative values
df['log_capital'] = np.log1p(df['CAPITAL_ASSURE'].clip(lower=0))
# FIX 2: log_prime removed from features to avoid data leakage
#         (PRIME_NETTE is used to compute the target, so it must not be a feature)

# Date features
date_col = next((c for c in df.columns if 'DATE' in c.upper()), None)
if date_col:
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df['month'] = df[date_col].dt.month
    df['year']  = df[date_col].dt.year

# ─────────────────────────────────────────────
# 5. ENCODING CATEGORICAL FEATURES
# ─────────────────────────────────────────────
cat_cols = ['WILAYA', 'COMMUNE', 'USAGE', 'GARANTIE', 'TYPE_CONTRAT']
encoders = {}

for col in cat_cols:
    if col in df.columns:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col])
        encoders[col] = le
        print(f"  ✔ Encoded {col}  ({df[col].nunique()} unique values)")

# ─────────────────────────────────────────────
# 6. FEATURE SELECTION
# Note: log_prime excluded — leakage risk (derived from PRIME_NETTE = target source)
# ─────────────────────────────────────────────
candidate_features = (
    [f'{c}_encoded' for c in cat_cols] +
    ['log_capital', 'month', 'year']   # ← log_prime removed
)
feature_cols = [c for c in candidate_features if c in df.columns]
print(f"\n📐 Features used: {feature_cols}")

X = df[feature_cols]
y = df['risk_tier']

# ─────────────────────────────────────────────
# 7. TRAIN / TEST SPLIT  (stratified)
# ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scale_weight = (y_train == 0).sum() / (y_train == 1).sum()
print(f"\n⚖️  scale_pos_weight: {scale_weight:.3f}")

# ─────────────────────────────────────────────
# 8. MODEL
# ─────────────────────────────────────────────
model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    scale_pos_weight=scale_weight,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    eval_metric='auc',
    early_stopping_rounds=30,
    random_state=42,
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=50,
)

# ─────────────────────────────────────────────
# 9. EVALUATION
# ─────────────────────────────────────────────
preds = model.predict(X_test)
proba = model.predict_proba(X_test)[:, 1]

print(f"\n✅ Accuracy : {accuracy_score(y_test, preds) * 100:.2f}%")
print(f"✅ AUC-ROC  : {roc_auc_score(y_test, proba):.4f}")
print()
print(classification_report(y_test, preds, target_names=['Low Risk', 'High Risk']))

# ─────────────────────────────────────────────
# 10. CROSS-VALIDATION  (confirms generalization)
# early_stopping_rounds requires eval_set, which CV can't provide
# so we use a clone of the model without early stopping for CV only
# ─────────────────────────────────────────────
print("\n🔁 Running 5-fold cross-validation...")
model_cv = xgb.XGBClassifier(
    n_estimators=model.best_iteration + 1,  # use the best number of trees found
    max_depth=6,
    learning_rate=0.05,
    scale_pos_weight=scale_weight,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    eval_metric='auc',
    random_state=42,
    # no early_stopping_rounds here
)
cv_scores = cross_val_score(model_cv, X, y, cv=5, scoring='roc_auc')
print(f"CV AUC: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ─────────────────────────────────────────────
# 11. FEATURE IMPORTANCE
# ─────────────────────────────────────────────
importance = (pd.Series(model.feature_importances_, index=feature_cols)
                .sort_values(ascending=False))
print("\n📊 Feature Importance:")
print(importance.to_string())

# ─────────────────────────────────────────────
# 12. SAVE MODEL
# ─────────────────────────────────────────────
model.save_model("risk_model.json")
print("\n💾 Model saved → risk_model.json")