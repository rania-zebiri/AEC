import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

def test_on_real_data(csv_path):
    # 1. Load your Algerian CATNAT data
    df = pd.read_csv(csv_path)

    # 2. Define Features (X) and Target (y)
    # Target 'claim' should be 1 if there was damage, 0 if not
    X = df[['wilaya_code', 'floors', 'wall_thickness', 'is_chained', 'year_built']]
    y = df['claim_occurred']

    # 3. Split: Training on past data, testing on 'future' data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Train the XGBoost Model
    model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1)
    model.fit(X_train, y_train)

    # 5. Make Predictions
    predictions = model.predict(X_test)

    # 6. GENERATE THE ACCURACY REPORT
    print("📊 REAL DATA PERFORMANCE REPORT")
    print("-" * 30)
    print(classification_report(y_test, predictions))
    
    # 7. CONFUSION MATRIX
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

if __name__ == "__main__":
    test_on_real_data('data/catnat_algeria_3years.csv')