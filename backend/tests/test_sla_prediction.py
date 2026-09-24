from fastapi.testclient import TestClient


def test_sla_breach_prediction_output(client: TestClient):
    """Test that SLA breach prediction returns probability, risk level, and contributing factors."""
    response = client.post("/api/sla/tickets/TCK-1048/predict-breach")
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["breach_probability"] <= 1.0
    assert data["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert len(data["contributing_factors"]) >= 1
    assert data["confidence"] > 0.80


def test_queue_pressure_and_agent_load_increase_risk(client: TestClient):
    """
    CRITICAL REQUIREMENT:
    Verify risk changes with live queue and capacity state!
    Same ticket under low queue (5) and low util (40%) vs high queue (35) and high util (92%).
    """
    # 1. Low Queue and Low Agent Load Scenario
    low_res = client.post(
        "/api/sla/tickets/TCK-1048/predict-breach",
        json={
            "ticket_id": "dummy",
            "current_queue_depth": 5,
            "department_queue_depth": 3,
            "agent_utilization": 0.40,
        },
    )
    assert low_res.status_code == 200
    low_data = low_res.json()
    low_risk = low_data["breach_probability"]

    # 2. High Queue and High Agent Load Scenario
    high_res = client.post(
        "/api/sla/tickets/TCK-1048/predict-breach",
        json={
            "ticket_id": "dummy",
            "current_queue_depth": 35,
            "department_queue_depth": 20,
            "agent_utilization": 0.92,
        },
    )
    assert high_res.status_code == 200
    high_data = high_res.json()
    high_risk = high_data["breach_probability"]

    # High queue/utilization MUST produce significantly higher risk probability!
    assert high_risk > low_risk, f"Expected high risk ({high_risk}) > low risk ({low_risk})"
    assert high_risk >= 0.70, f"Expected high risk >= 0.70 under stress, got {high_risk}"
    assert high_data["risk_level"] in ["HIGH", "CRITICAL"]


def test_fallback_predictor_works_independently():
    """Verify deterministic fallback predictor calculates valid risk and explanations."""
    from app.ml.fallback_predictor import FallbackSLAPredictor
    predictor = FallbackSLAPredictor()

    features_normal = {
        "sla_consumed_percent": 30.0,
        "sla_remaining_minutes": 120.0,
        "queue_depth": 8.0,
        "department_queue_depth": 4.0,
        "agent_utilization": 0.45,
        "priority_num": 2.0,
        "urgency_num": 2.0,
    }
    prob_normal, risk_normal, conf_normal, factors_normal = predictor.predict(features_normal)
    assert prob_normal < 0.45
    assert risk_normal in ["LOW", "MEDIUM"]

    features_critical = {
        "sla_consumed_percent": 85.0,
        "sla_remaining_minutes": 15.0,
        "queue_depth": 38.0,
        "department_queue_depth": 22.0,
        "agent_utilization": 0.95,
        "priority_num": 4.0,
        "urgency_num": 4.0,
    }
    prob_crit, risk_crit, conf_crit, factors_crit = predictor.predict(features_critical)
    assert prob_crit >= 0.80
    assert risk_crit == "CRITICAL"
    assert any("remaining below 20 minutes" in f or "queue depth" in f for f in factors_crit)
