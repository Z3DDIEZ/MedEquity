import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COMMON_SYMPTOMS } from "../types";
import type { SymptomEntry } from "../types";
import { analyzeSymptoms } from "../api";

/**
 * Symptom intake form — collects demographics and symptoms,
 * then calls the triage API and navigates to the result page.
 */
export default function TriagePage() {
  const navigate = useNavigate();

  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [geography, setGeography] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSymptom(code: string, label: string) {
    setSelectedSymptoms((prev) => {
      const exists = prev.find((s) => s.symptomCode === code);
      if (exists) {
        return prev.filter((s) => s.symptomCode !== code);
      }
      return [
        ...prev,
        { symptomCode: code, severity: 5, durationHours: 24, label },
      ];
    });
  }

  function updateSeverity(code: string, severity: number) {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomCode === code ? { ...s, severity } : s)),
    );
  }

  function updateDuration(code: string, durationHours: number) {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomCode === code ? { ...s, durationHours } : s)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!ageRange || !sex || !geography) {
      setError("Please fill in all demographic fields.");
      return;
    }
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSymptoms({
        ageRange,
        sex,
        geography,
        symptoms: selectedSymptoms.map(
          ({ symptomCode, severity, durationHours }) => ({
            symptomCode,
            severity,
            durationHours,
          }),
        ),
      });
      navigate("/result", { state: { result } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="triage-page">
      <h1>Symptom Check</h1>
      <p className="page-description">
        Tell us about your symptoms. We'll recommend the appropriate care
        setting.
      </p>

      <form onSubmit={handleSubmit} className="triage-form">
        {/* Demographics */}
        <fieldset className="demographics">
          <legend>Your Information</legend>

          <label>
            Age Range
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="0-10">0-10</option>
              <option value="10-20">10-20</option>
              <option value="20-30">20-30</option>
              <option value="30-40">30-40</option>
              <option value="40-50">40-50</option>
              <option value="50-60">50-60</option>
              <option value="60-70">60-70</option>
              <option value="70+">70+</option>
            </select>
          </label>

          <label>
            Sex
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Location
            <select
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Johannesburg Metro">Johannesburg Metro</option>
              <option value="Tshwane Metro">Tshwane Metro</option>
              <option value="Ekurhuleni Metro">Ekurhuleni Metro</option>
              <option value="eThekwini Metro">eThekwini Metro</option>
              <option value="Cape Town Metro">Cape Town Metro</option>
              <option value="Rural Gauteng">Rural Gauteng</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </fieldset>

        {/* Symptom Selection */}
        <fieldset className="symptoms-section">
          <legend>Select Your Symptoms</legend>
          <div className="symptom-grid">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.some(
                (s) => s.symptomCode === symptom.code,
              );
              return (
                <button
                  key={symptom.code}
                  type="button"
                  className={`symptom-chip ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSymptom(symptom.code, symptom.label)}
                >
                  {symptom.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Severity & Duration Sliders */}
        {selectedSymptoms.length > 0 && (
          <fieldset className="severity-section">
            <legend>Rate Your Symptoms</legend>
            {selectedSymptoms.map((symptom) => (
              <div key={symptom.symptomCode} className="symptom-detail">
                <h4>{symptom.label}</h4>
                <label>
                  Severity: <strong>{symptom.severity}/10</strong>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={symptom.severity}
                    onChange={(e) =>
                      updateSeverity(
                        symptom.symptomCode,
                        Number(e.target.value),
                      )
                    }
                  />
                </label>
                <label>
                  Duration (hours): <strong>{symptom.durationHours}h</strong>
                  <input
                    type="range"
                    min={1}
                    max={168}
                    value={symptom.durationHours}
                    onChange={(e) =>
                      updateDuration(
                        symptom.symptomCode,
                        Number(e.target.value),
                      )
                    }
                  />
                </label>
              </div>
            ))}
          </fieldset>
        )}

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Analyzing..." : "Get Recommendation"}
        </button>
      </form>
    </main>
  );
}
