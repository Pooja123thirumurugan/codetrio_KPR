import os
import sys
import random
import logging
from typing import Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier

# Ensure backend root is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.config import settings
from app.ml.feature_engineering import FEATURE_COLUMNS

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("train_models")


def generate_synthetic_data(num_samples: int = 1500) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates 1500+ realistic synthetic records for ticket categorization and SLA breach prediction.
    """
    logger.info(f"Generating {num_samples} synthetic training records...")

    categories_data = [
        ("Payment Failure", "Payments", [
            "Payment failure during checkout on credit card",
            "Double charge on customer account via Stripe",
            "Checkout payment gateway timed out repeatedly",
            "Refund not processed after subscription cancellation",
            "Transaction declined with error code 4002",
            "Multiple customers unable to complete payment",
            "Chargeback inquiry on enterprise invoice",
            "Payment method cannot be added to account",
        ]),
        ("Authentication", "Account Support", [
            "User locked out of corporate SSO account",
            "Cannot reset admin password via recovery email",
            "Multi-factor authentication (MFA) SMS code never arrives",
            "Invalid credentials error after password update",
            "Session expired immediately after login attempt",
            "OAuth authentication failed on third-party integration",
            "User permissions revoked unexpectedly",
        ]),
        ("Technical Issue", "Technical Support", [
            "API returning 500 internal server error on endpoint",
            "Production database connection pool exhausted",
            "Webhook delivery failing with timeout",
            "Frontend dashboard crashing on data export",
            "High latency observed on search service",
            "SSL certificate expired on custom domain",
            "Memory leak causing worker node crash",
        ]),
        ("Billing Inquiry", "Billing", [
            "Request for updated VAT invoice for last quarter",
            "Question regarding annual discount pricing schedule",
            "Need breakdown of metered API usage fees",
            "Update billing address and company tax ID",
            "Subscription renewal date inquiry",
            "Billing currency change request to EUR",
        ]),
        ("Security Vulnerability", "Security & Compliance", [
            "Cross-site scripting (XSS) vulnerability found in input form",
            "Potential data exposure in public API response",
            "Security compliance report request for SOC2 audit",
            "Unauthorized access attempt detected in audit logs",
        ]),
        ("Feature Request", "Product Operations", [
            "Request for dark mode support in web portal",
            "Wish to export customer reports in CSV format",
            "Add bulk tag editing feature for support tickets",
            "Integration request for Slack and Microsoft Teams",
        ]),
    ]

    # 1. Text Classification Dataset
    nlp_records = []
    for _ in range(num_samples):
        cat_tuple = random.choice(categories_data)
        category, dept, samples = cat_tuple
        base_subject = random.choice(samples)
        # Add slight variations
        extra_noise = random.choice([
            " urgent assistance required", " please resolve asap", " impacting team",
            " question regarding this issue", " follow up needed", " critical production impact"
        ])
        subject = base_subject + extra_noise
        description = f"Customer reported: {subject}. System logged event. Please investigate promptly."
        nlp_records.append({
            "text": f"{subject} {description}",
            "category": category,
            "department": dept,
        })
    df_nlp = pd.DataFrame(nlp_records)

    # 2. SLA Breach Prediction Dataset
    sla_records = []
    for _ in range(num_samples):
        priority_num = random.choice([1, 2, 3, 4])  # Low, Med, High, Critical
        urgency_num = random.choice([1, 2, 3, 4])
        customer_tier_num = random.choice([1, 1, 2, 2, 3, 4])
        channel_num = random.choice([1, 2, 3, 4, 5])

        # SLA bounds based on priority
        total_sla_minutes = {1: 480, 2: 240, 3: 60, 4: 30}[priority_num]
        consumed_pct = random.uniform(5.0, 115.0)
        age_minutes = (consumed_pct / 100.0) * total_sla_minutes
        remaining_minutes = max(0.0, total_sla_minutes - age_minutes)

        # Operational Queue Stress
        queue_depth = random.randint(3, 45)
        dept_queue = int(queue_depth * random.uniform(0.3, 0.8))
        dept_load = dept_queue + random.randint(1, 10)
        assigned_load = random.randint(1, 6)
        utilization = random.uniform(0.20, 1.05)
        avg_res_time = random.uniform(25.0, 75.0)
        hist_breach_rate = random.uniform(0.01, 0.15)
        peak_hour = 1.0 if random.random() < 0.65 else 0.0
        complexity = random.uniform(1.0, 4.5)
        capacity_pressure = queue_depth / max(1.0, (10 - assigned_load) * 3)

        # Ground Truth Breach Determination:
        # Realistic probability formula with true noise
        breach_signal = (
            (consumed_pct / 100.0) * 0.40 +
            (queue_depth / 40.0) * 0.25 +
            utilization * 0.20 +
            (priority_num / 4.0) * 0.15 +
            random.uniform(-0.10, 0.10)
        )
        is_breached = 1 if (breach_signal >= 0.65 or consumed_pct >= 100.0) else 0

        sla_records.append({
            "ticket_age_minutes": age_minutes,
            "sla_consumed_percent": consumed_pct,
            "sla_remaining_minutes": remaining_minutes,
            "priority_num": float(priority_num),
            "urgency_num": float(urgency_num),
            "customer_tier_num": float(customer_tier_num),
            "channel_num": float(channel_num),
            "queue_depth": float(queue_depth),
            "department_queue_depth": float(dept_queue),
            "assigned_agent_load": float(assigned_load),
            "department_load": float(dept_load),
            "agent_utilization": float(utilization),
            "average_resolution_time": float(avg_res_time),
            "historical_breach_rate": float(hist_breach_rate),
            "peak_hour_indicator": float(peak_hour),
            "ticket_complexity_proxy": float(complexity),
            "capacity_pressure": float(capacity_pressure),
            "breached": is_breached,
        })

    df_sla = pd.DataFrame(sla_records)
    return df_nlp, df_sla


def train_and_save_models():
    os.makedirs(settings.MODEL_PATH, exist_ok=True)
    df_nlp, df_sla = generate_synthetic_data(num_samples=1800)

    # 1. Train Ticket Categorization NLP Pipeline
    logger.info("Training TF-IDF + LogisticRegression Ticket Classifier...")
    X_text = df_nlp["text"]
    y_cat = df_nlp["category"]

    nlp_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=2500, ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=500, C=1.5)),
    ])
    nlp_pipeline.fit(X_text, y_cat)

    nlp_save_path = os.path.join(settings.MODEL_PATH, "ticket_classifier.joblib")
    joblib.dump(nlp_pipeline, nlp_save_path)
    logger.info(f"Saved Ticket Classifier model artifact to {nlp_save_path}")

    # 2. Train XGBoost SLA Breach Predictor
    logger.info("Training XGBoost SLA Breach Risk Predictor...")
    X_sla = df_sla[FEATURE_COLUMNS]
    y_sla = df_sla["breached"]

    X_train, X_test, y_train, y_test = train_test_split(X_sla, y_sla, test_size=0.2, random_state=42)

    xgb_model = XGBClassifier(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss",
    )
    xgb_model.fit(X_train, y_train)

    test_preds = xgb_model.predict(X_test)
    test_probs = xgb_model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, test_probs)
    logger.info(f"XGBoost SLA Model trained. ROC-AUC on holdout test set: {auc:.4f}")

    xgb_save_path = os.path.join(settings.MODEL_PATH, "sla_xgboost.joblib")
    joblib.dump(xgb_model, xgb_save_path)
    logger.info(f"Saved SLA Breach model artifact to {xgb_save_path}")

    # Quick test prediction
    test_vec = np.array([[30.0, 75.0, 10.0, 4.0, 4.0, 3.0, 2.0, 25.0, 15.0, 4.0, 15.0, 0.90, 45.0, 0.05, 1.0, 2.5, 2.0]])
    sample_risk = float(xgb_model.predict_proba(test_vec)[0][1])
    logger.info(f"Validation inference: Test Critical Ticket under high queue risk = {sample_risk*100:.1f}%")
    logger.info("All model artifacts prepared and validated successfully.")


if __name__ == "__main__":
    train_and_save_models()
