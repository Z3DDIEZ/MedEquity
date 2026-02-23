import pytest
from gemini_triage_service import GeminiTriageService

def test_fallback_response():
    """Test that the fallback response returns the expected structure and defaults."""
    response = GeminiTriageService._fallback_response()
    
    assert "care_level" in response
    assert response["care_level"] == "primary_care"
    assert response["confidence"] == 0.1
    assert "primary_concern" in response
    assert "reasoning" in response
    assert "red_flags" in response
    assert "next_steps" in response
    assert response["model_version"] == "fallback"
