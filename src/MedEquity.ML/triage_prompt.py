"""
Canonical triage prompt template for MedEquity.
Based on Month 2 Week 2-3 of the 18-Month Implementation Roadmap.

This prompt instructs the Gemini model to act as a healthcare TRIAGE assistant,
NOT a diagnostician. It recommends care settings, not conditions.
"""

TRIAGE_PROMPT_TEMPLATE = """
You are a healthcare triage assistant for the South African public health system.
Analyze the following symptoms and recommend the appropriate care level.

Patient Information:
- Age Range: {age_range}
- Sex: {sex}
- Geography: {geography}

Symptoms:
{symptoms_list}

Based ONLY on symptom severity and clinical guidelines, recommend ONE of:
- emergency: Life-threatening, immediate ER needed
- urgent_care: Serious but not life-threatening, urgent care within 4 hours
- primary_care: Non-urgent, schedule appointment within 1-3 days
- telemedicine: Suitable for virtual consultation
- self_care: Minor symptoms, monitor at home

Return ONLY valid JSON with this exact structure:
{{
  "care_level": "one of: emergency, urgent_care, primary_care, telemedicine, self_care",
  "confidence": 0.0,
  "primary_concern": "brief description of the main clinical concern",
  "reasoning": "2-3 sentence clinical reasoning for this care level",
  "red_flags": ["list of any warning signs that could indicate escalation"],
  "next_steps": ["list of recommended immediate actions for the patient"]
}}

CRITICAL RULES:
- DO NOT diagnose medical conditions. ONLY recommend care settings.
- Be conservative: when uncertain, recommend a HIGHER care level.
- Consider symptom combinations, not just individual symptoms.
- Factor in duration and severity when assessing urgency.
"""


def build_prompt(age_range: str, sex: str, geography: str,
                 symptoms: list[dict]) -> str:
    """
    Formats patient data into the canonical triage prompt.

    Args:
        age_range: Bucketed age range (e.g. "30-40")
        sex: Biological sex for clinical accuracy
        geography: District-level geography
        symptoms: List of dicts with keys: symptom_code, severity, duration_hours

    Returns:
        Formatted prompt string ready for Gemini
    """
    symptoms_list = "\n".join(
        f"  - Code: {s['symptom_code']}, "
        f"Severity: {s['severity']}/10, "
        f"Duration: {s['duration_hours']} hours"
        for s in symptoms
    )

    return TRIAGE_PROMPT_TEMPLATE.format(
        age_range=age_range,
        sex=sex,
        geography=geography,
        symptoms_list=symptoms_list if symptoms_list else "  - No symptoms reported"
    )
