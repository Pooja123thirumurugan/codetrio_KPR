from fastapi.testclient import TestClient


def test_ai_response_generation_with_fallback(client: TestClient):
    """
    Test generating an auto-drafted response.
    Service MUST succeed and return high-fidelity response even if Gemini API key is missing.
    """
    response = client.post(
        "/api/tickets/TCK-1048/ai-response",
        json={"tone": "PROFESSIONAL", "custom_instructions": "Assure customer of prompt follow-up"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_id"] is not None
    assert len(data["suggested_response"]) > 50
    assert data["provider"] in ["gemini", "template_fallback"]
    assert data["confidence"] >= 0.85
    assert data["status"] == "DRAFTED"
    # Ensure ticket context is present in draft
    assert "TCK-1048" in data["suggested_response"] or "payment" in data["suggested_response"].lower()
