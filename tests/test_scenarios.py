"""
Synthetic test scenarios for MedEquity triage validation.
20 cases covering all 5 care levels (4 per level).
Run: python test_scenarios.py

These test the end-to-end flow via the HTTP API (/api/triage/analyze).
"""

import json
import sys
import time

try:
    import requests
except ImportError:
    print("Installing requests...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

API_URL = "http://localhost:5000/api/triage/analyze"

# ====== 20 Synthetic Test Cases ======

TEST_CASES = [
    # --- EMERGENCY (4 cases) ---
    {
        "name": "Severe chest pain + shortness of breath",
        "expected": "emergency",
        "request": {
            "ageRange": "50-60",
            "sex": "Male",
            "geography": "Johannesburg Metro",
            "symptoms": [
                {"symptomCode": "162397003", "severity": 9, "durationHours": 2},
                {"symptomCode": "267036007", "severity": 8, "durationHours": 1},
            ],
        },
    },
    {
        "name": "High fever + severe headache + confusion (child)",
        "expected": "emergency",
        "request": {
            "ageRange": "0-10",
            "sex": "Female",
            "geography": "Rural Gauteng",
            "symptoms": [
                {"symptomCode": "386661006", "severity": 10, "durationHours": 6},
                {"symptomCode": "25064002", "severity": 9, "durationHours": 4},
            ],
        },
    },
    {
        "name": "Difficulty breathing + chest tightness",
        "expected": "emergency",
        "request": {
            "ageRange": "70+",
            "sex": "Male",
            "geography": "Tshwane Metro",
            "symptoms": [
                {"symptomCode": "267036007", "severity": 10, "durationHours": 1},
                {"symptomCode": "162397003", "severity": 7, "durationHours": 1},
            ],
        },
    },
    {
        "name": "Severe abdominal pain + nausea + fever",
        "expected": "emergency",
        "request": {
            "ageRange": "30-40",
            "sex": "Female",
            "geography": "eThekwini Metro",
            "symptoms": [
                {"symptomCode": "21522001", "severity": 10, "durationHours": 3},
                {"symptomCode": "422587007", "severity": 8, "durationHours": 2},
                {"symptomCode": "386661006", "severity": 8, "durationHours": 4},
            ],
        },
    },

    # --- URGENT CARE (4 cases) ---
    {
        "name": "Moderate fever + persistent cough",
        "expected": "urgent_care",
        "request": {
            "ageRange": "30-40",
            "sex": "Male",
            "geography": "Johannesburg Metro",
            "symptoms": [
                {"symptomCode": "386661006", "severity": 7, "durationHours": 48},
                {"symptomCode": "49727002", "severity": 6, "durationHours": 72},
            ],
        },
    },
    {
        "name": "Worsening sore throat + difficulty swallowing",
        "expected": "urgent_care",
        "request": {
            "ageRange": "20-30",
            "sex": "Female",
            "geography": "Cape Town Metro",
            "symptoms": [
                {"symptomCode": "162076009", "severity": 7, "durationHours": 48},
                {"symptomCode": "386661006", "severity": 6, "durationHours": 24},
            ],
        },
    },
    {
        "name": "Persistent abdominal pain + nausea",
        "expected": "urgent_care",
        "request": {
            "ageRange": "40-50",
            "sex": "Male",
            "geography": "Ekurhuleni Metro",
            "symptoms": [
                {"symptomCode": "21522001", "severity": 6, "durationHours": 24},
                {"symptomCode": "422587007", "severity": 5, "durationHours": 12},
            ],
        },
    },
    {
        "name": "Fever + body aches + fatigue in elderly",
        "expected": "urgent_care",
        "request": {
            "ageRange": "60-70",
            "sex": "Female",
            "geography": "Rural Gauteng",
            "symptoms": [
                {"symptomCode": "386661006", "severity": 7, "durationHours": 36},
                {"symptomCode": "68962001", "severity": 6, "durationHours": 48},
                {"symptomCode": "84229001", "severity": 7, "durationHours": 48},
            ],
        },
    },

    # --- PRIMARY CARE (4 cases) ---
    {
        "name": "Mild persistent cough + runny nose",
        "expected": "primary_care",
        "request": {
            "ageRange": "20-30",
            "sex": "Male",
            "geography": "Johannesburg Metro",
            "symptoms": [
                {"symptomCode": "49727002", "severity": 4, "durationHours": 120},
                {"symptomCode": "386661006", "severity": 3, "durationHours": 72},
            ],
        },
    },
    {
        "name": "Recurring headaches over weeks",
        "expected": "primary_care",
        "request": {
            "ageRange": "30-40",
            "sex": "Female",
            "geography": "Tshwane Metro",
            "symptoms": [
                {"symptomCode": "25064002", "severity": 5, "durationHours": 168},
            ],
        },
    },
    {
        "name": "Mild skin rash + itching",
        "expected": "primary_care",
        "request": {
            "ageRange": "10-20",
            "sex": "Male",
            "geography": "Cape Town Metro",
            "symptoms": [
                {"symptomCode": "271807003", "severity": 4, "durationHours": 72},
            ],
        },
    },
    {
        "name": "Moderate fatigue + mild muscle pain",
        "expected": "primary_care",
        "request": {
            "ageRange": "40-50",
            "sex": "Female",
            "geography": "Ekurhuleni Metro",
            "symptoms": [
                {"symptomCode": "84229001", "severity": 5, "durationHours": 168},
                {"symptomCode": "68962001", "severity": 4, "durationHours": 72},
            ],
        },
    },

    # --- TELEMEDICINE (4 cases) ---
    {
        "name": "Mild sore throat + low fever",
        "expected": "telemedicine",
        "request": {
            "ageRange": "20-30",
            "sex": "Female",
            "geography": "Johannesburg Metro",
            "symptoms": [
                {"symptomCode": "162076009", "severity": 3, "durationHours": 24},
                {"symptomCode": "386661006", "severity": 2, "durationHours": 12},
            ],
        },
    },
    {
        "name": "Intermittent dizziness",
        "expected": "telemedicine",
        "request": {
            "ageRange": "30-40",
            "sex": "Male",
            "geography": "Cape Town Metro",
            "symptoms": [
                {"symptomCode": "3006004", "severity": 3, "durationHours": 48},
            ],
        },
    },
    {
        "name": "Mild nausea after meals",
        "expected": "telemedicine",
        "request": {
            "ageRange": "20-30",
            "sex": "Female",
            "geography": "eThekwini Metro",
            "symptoms": [
                {"symptomCode": "422587007", "severity": 3, "durationHours": 72},
            ],
        },
    },
    {
        "name": "Mild cough + mild fatigue",
        "expected": "telemedicine",
        "request": {
            "ageRange": "40-50",
            "sex": "Male",
            "geography": "Tshwane Metro",
            "symptoms": [
                {"symptomCode": "49727002", "severity": 2, "durationHours": 48},
                {"symptomCode": "84229001", "severity": 3, "durationHours": 72},
            ],
        },
    },

    # --- SELF CARE (4 cases) ---
    {
        "name": "Very mild headache",
        "expected": "self_care",
        "request": {
            "ageRange": "20-30",
            "sex": "Male",
            "geography": "Johannesburg Metro",
            "symptoms": [
                {"symptomCode": "25064002", "severity": 2, "durationHours": 4},
            ],
        },
    },
    {
        "name": "Minor muscle soreness after exercise",
        "expected": "self_care",
        "request": {
            "ageRange": "20-30",
            "sex": "Female",
            "geography": "Cape Town Metro",
            "symptoms": [
                {"symptomCode": "68962001", "severity": 2, "durationHours": 12},
            ],
        },
    },
    {
        "name": "Very mild fatigue",
        "expected": "self_care",
        "request": {
            "ageRange": "30-40",
            "sex": "Male",
            "geography": "Tshwane Metro",
            "symptoms": [
                {"symptomCode": "84229001", "severity": 1, "durationHours": 24},
            ],
        },
    },
    {
        "name": "Minor sore throat (just started)",
        "expected": "self_care",
        "request": {
            "ageRange": "10-20",
            "sex": "Female",
            "geography": "Ekurhuleni Metro",
            "symptoms": [
                {"symptomCode": "162076009", "severity": 2, "durationHours": 6},
            ],
        },
    },
]

# Care level severity ordering for "close enough" scoring
SEVERITY_ORDER = ["self_care", "telemedicine", "primary_care", "urgent_care", "emergency"]


def run_tests():
    print(f"\n{'='*70}")
    print(f"  MedEquity Triage Validation — {len(TEST_CASES)} Synthetic Scenarios")
    print(f"{'='*70}\n")

    results = {"pass": 0, "close": 0, "fail": 0, "error": 0}
    details = []

    for i, case in enumerate(TEST_CASES, 1):
        print(f"  [{i:2d}/20] {case['name'][:50]:<50}", end="", flush=True)

        try:
            resp = requests.post(API_URL, json=case["request"], timeout=30)
            resp.raise_for_status()
            data = resp.json()
            actual = data.get("careLevel", "unknown")
            expected = case["expected"]

            if actual == expected:
                print(f"  ✓ {actual}")
                results["pass"] += 1
                status = "PASS"
            else:
                # Check if within 1 severity level (conservative bias is acceptable)
                actual_idx = SEVERITY_ORDER.index(actual) if actual in SEVERITY_ORDER else -1
                expected_idx = SEVERITY_ORDER.index(expected)
                diff = actual_idx - expected_idx

                if diff == 1:
                    # Model recommended MORE urgent care — conservative, acceptable
                    print(f"  ~ {actual} (expected {expected}, conservative)")
                    results["close"] += 1
                    status = "CLOSE"
                else:
                    print(f"  ✗ {actual} (expected {expected})")
                    results["fail"] += 1
                    status = "FAIL"

            details.append({
                "case": case["name"],
                "expected": expected,
                "actual": actual,
                "confidence": data.get("confidence", 0),
                "status": status,
            })

        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            results["error"] += 1
            details.append({
                "case": case["name"],
                "expected": case["expected"],
                "actual": "ERROR",
                "confidence": 0,
                "status": "ERROR",
            })

        # Rate limit: Free tier = 5 RPM, so wait 15s between requests
        time.sleep(15)

    # Summary
    total = len(TEST_CASES)
    exact = results["pass"]
    close = results["close"]
    acceptable = exact + close

    print(f"\n{'='*70}")
    print(f"  RESULTS")
    print(f"{'='*70}")
    print(f"  Exact match:     {exact:2d}/{total}  ({exact/total*100:.0f}%)")
    print(f"  Conservative:    {close:2d}/{total}  (higher care, acceptable)")
    print(f"  Failed:          {results['fail']:2d}/{total}")
    print(f"  Errors:          {results['error']:2d}/{total}")
    print(f"  ---")
    print(f"  Acceptable:      {acceptable:2d}/{total}  ({acceptable/total*100:.0f}%)")
    print(f"  Target:          >80% acceptable")
    print(f"{'='*70}\n")

    return results


if __name__ == "__main__":
    run_tests()
