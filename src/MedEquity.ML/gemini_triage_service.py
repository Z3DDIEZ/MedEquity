"""
Gemini Triage Service — integrates with Google Gen AI SDK (unified).
Uses the google-genai package (NOT the old google-generativeai).

Handles: prompt building, Gemini API calls, JSON response parsing,
schema validation, and fallback responses.
"""

import json
import logging
import os
import time

from google import genai
from triage_prompt import build_prompt

logger = logging.getLogger(__name__)

# Valid care levels matching CareLevel enum in MedEquity.Core
VALID_CARE_LEVELS = {
    "emergency", "urgent_care", "primary_care", "telemedicine", "self_care"
}

MODEL_ID = "gemini-2.5-flash"


class GeminiTriageService:
    """Analyzes symptoms using Google Gemini and returns structured triage results."""

    def __init__(self, api_key: str | None = None):
        key = api_key or os.getenv("GEMINI_API_KEY")
        if not key:
            raise ValueError(
                "GEMINI_API_KEY is required. Set it as an environment variable "
                "or pass it to the constructor."
            )
        self.client = genai.Client(api_key=key)
        logger.info("GeminiTriageService initialized with model: %s", MODEL_ID)

    def analyze_symptoms(
        self,
        age_range: str,
        sex: str,
        geography: str,
        symptoms: list[dict],
    ) -> dict:
        """
        Analyze patient symptoms and return a triage recommendation.

        Returns a dict with keys: care_level, confidence, primary_concern,
        reasoning, red_flags, next_steps, model_version
        """
        prompt = build_prompt(age_range, sex, geography, symptoms)

        for attempt in range(3):
            try:
                response = self.client.models.generate_content(
                    model=MODEL_ID,
                    contents=prompt,
                )

                result = self._parse_response(response.text)
                result["model_version"] = MODEL_ID
                return result

            except json.JSONDecodeError as e:
                logger.warning(
                    "Attempt %d: Failed to parse Gemini JSON response: %s",
                    attempt + 1, e
                )
            except Exception as e:
                logger.error(
                    "Attempt %d: Gemini API error: %s", attempt + 1, e
                )

            # Exponential backoff: 1s, 2s, 4s
            if attempt < 2:
                time.sleep(2 ** attempt)

        logger.error("All 3 Gemini attempts failed. Returning fallback.")
        return self._fallback_response()

    def _parse_response(self, raw_text: str) -> dict:
        """Parse and validate the JSON response from Gemini."""
        # Strip markdown code fences if present
        text = raw_text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first line (```json) and last line (```)
            text = "\n".join(lines[1:-1]).strip()

        result = json.loads(text)

        # Validate required fields
        if "care_level" not in result:
            raise ValueError("Missing 'care_level' in response")

        # Normalize care_level
        care_level = result["care_level"].lower().strip()
        if care_level not in VALID_CARE_LEVELS:
            logger.warning(
                "Unknown care_level '%s', defaulting to 'primary_care'",
                care_level
            )
            care_level = "primary_care"

        # Clamp confidence to 0-1
        confidence = float(result.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))

        return {
            "care_level": care_level,
            "confidence": confidence,
            "primary_concern": result.get("primary_concern", "Unable to determine"),
            "reasoning": result.get("reasoning", "Analysis unavailable"),
            "red_flags": result.get("red_flags", []),
            "next_steps": result.get("next_steps", []),
        }

    @staticmethod
    def _fallback_response() -> dict:
        """
        Conservative fallback when Gemini is unavailable.
        Defaults to primary_care with low confidence so a nurse will review.
        """
        return {
            "care_level": "primary_care",
            "confidence": 0.1,
            "primary_concern": "Unable to complete AI analysis",
            "reasoning": (
                "The AI triage service was temporarily unavailable. "
                "Defaulting to primary care for safety. "
                "A healthcare professional should review this case."
            ),
            "red_flags": ["AI analysis unavailable — manual review required"],
            "next_steps": [
                "Visit your nearest primary care clinic",
                "If symptoms worsen, proceed to emergency services"
            ],
            "model_version": "fallback",
        }
