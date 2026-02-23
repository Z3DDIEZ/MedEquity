import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SYMPTOM_CATEGORIES, DURATION_PRESETS, formatDuration } from "../types";
import type { SymptomEntry, VitalSigns } from "../types";
import { analyzeSymptoms } from "../api";

const STEP_LABELS = ["Info", "Symptoms", "Details", "Review"];

/**
 * 4-step symptom intake wizard:
 *   1. Demographics
 *   2. Symptom selection (grouped + searchable)
 *   3. Severity, duration, optional vitals
 *   4. Review & submit
 *
 * Submit only fires on explicit button click at step 4.
 */
export default function TriagePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [geography, setGeography] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Symptom helpers ── */

  function toggleSymptom(code: string, label: string) {
    setSelectedSymptoms((prev) => {
      const exists = prev.find((s) => s.symptomCode === code);
      if (exists) return prev.filter((s) => s.symptomCode !== code);
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

  /** Severity color class based on value */
  function severityClass(val: number): string {
    if (val <= 3) return "severity-low";
    if (val <= 6) return "severity-medium";
    return "severity-high";
  }

  /* ── Filtered symptoms for search ── */

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SYMPTOM_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return SYMPTOM_CATEGORIES.map((cat) => ({
      ...cat,
      symptoms: cat.symptoms.filter((s) => s.label.toLowerCase().includes(q)),
    })).filter((cat) => cat.symptoms.length > 0);
  }, [searchQuery]);

  /* ── Navigation ── */

  function handleNext() {
    setError(null);
    if (step === 1 && (!ageRange || !sex || !geography)) {
      setError("Please fill in all fields to continue.");
      return;
    }
    if (step === 2 && selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    setStep((s) => s - 1);
  }

  function goToStep(target: number) {
    setError(null);
    setStep(target);
  }

  /* ── Submit — only fires from the Review step button ── */

  async function handleSubmit() {
    setError(null);
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
        vitalSigns:
          vitals.temperature || vitals.heartRate || vitals.systolicBP
            ? vitals
            : undefined,
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

  /* ── Render ── */

  return (
    <main className="triage-page">
      <h1>Symptom Check</h1>
      <p className="page-description">
        Answer a few guided questions so we can recommend the right care
        setting.
      </p>

      {/* Progress */}
      <div className="wizard-progress">
        {[1, 2, 3, 4].map((num, i) => (
          <span key={num} style={{ display: "contents" }}>
            <div
              className={`step-indicator ${step === num ? "active" : ""} ${step > num ? "completed" : ""}`}
            >
              {step > num ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                num
              )}
              <span className="step-label">{STEP_LABELS[i]}</span>
            </div>
            {num < 4 && (
              <div
                className={`step-connector ${step > num ? "completed" : ""}`}
              />
            )}
          </span>
        ))}
      </div>

      {/*
        Use a <div> instead of <form> to prevent Enter-key submission.
        Submit is handled by explicit button onClick at step 4.
      */}
      <div className="triage-form">
        {error && (
          <div className="error-message">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ═════ STEP 1: Demographics ═════ */}
        {step === 1 && (
          <div className="step-content" key="step-1">
            <h2 className="step-title">Your Information</h2>
            <div className="demographics">
              <div className="input-group">
                <label htmlFor="age-range">Age Range</label>
                <select
                  id="age-range"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                >
                  <option value="">Select age range...</option>
                  <option value="0-10">0 – 10 years</option>
                  <option value="10-20">10 – 20 years</option>
                  <option value="20-30">20 – 30 years</option>
                  <option value="30-40">30 – 40 years</option>
                  <option value="40-50">40 – 50 years</option>
                  <option value="50-60">50 – 60 years</option>
                  <option value="60-70">60 – 70 years</option>
                  <option value="70+">70+ years</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="sex">Sex at Birth</label>
                <select
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="geography">General Location</label>
                <select
                  id="geography"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                >
                  <option value="">Select region...</option>
                  <option value="Johannesburg Metro">Johannesburg Metro</option>
                  <option value="Tshwane Metro">Tshwane Metro</option>
                  <option value="Ekurhuleni Metro">Ekurhuleni Metro</option>
                  <option value="eThekwini Metro">eThekwini Metro</option>
                  <option value="Cape Town Metro">Cape Town Metro</option>
                  <option value="Rural Gauteng">Rural Gauteng</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ═════ STEP 2: Symptom Selection ═════ */}
        {step === 2 && (
          <div className="step-content" key="step-2">
            <h2 className="step-title">What are your symptoms?</h2>

            {/* Search */}
            <div className="symptom-search-wrapper">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="symptom-search"
                placeholder="Search symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Grouped chips */}
            {filteredCategories.map((cat) => (
              <div key={cat.category} className="symptom-category">
                <div className="category-label">{cat.category}</div>
                <div className="symptom-grid">
                  {cat.symptoms.map((symptom) => {
                    const isSelected = selectedSymptoms.some(
                      (s) => s.symptomCode === symptom.code,
                    );
                    return (
                      <button
                        key={symptom.code}
                        type="button"
                        className={`symptom-chip ${isSelected ? "selected" : ""}`}
                        onClick={() =>
                          toggleSymptom(symptom.code, symptom.label)
                        }
                      >
                        {symptom.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <p
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                No symptoms match your search.
              </p>
            )}
          </div>
        )}

        {/* ═════ STEP 3: Severity + Duration + Vitals ═════ */}
        {step === 3 && (
          <div className="step-content" key="step-3">
            <h2 className="step-title">How severe are they?</h2>

            {selectedSymptoms.map((symptom) => (
              <div key={symptom.symptomCode} className="symptom-detail">
                <h4>{symptom.label}</h4>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Severity</span>
                    <span
                      className={`slider-value ${severityClass(symptom.severity)}`}
                    >
                      {symptom.severity} / 10
                    </span>
                  </div>
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
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Duration</span>
                    <span className="slider-value">
                      {formatDuration(symptom.durationHours)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={168}
                    step={1}
                    value={symptom.durationHours}
                    onChange={(e) =>
                      updateDuration(
                        symptom.symptomCode,
                        Number(e.target.value),
                      )
                    }
                  />
                  {/* Preset buttons */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.35rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        className={`symptom-chip ${symptom.durationHours === p.value ? "selected" : ""}`}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.3rem 0.6rem",
                        }}
                        onClick={() =>
                          updateDuration(symptom.symptomCode, p.value)
                        }
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Optional vitals */}
            <div className="vitals-section">
              <div className="vitals-title">
                Optional: Vital Signs (if available)
              </div>
              <div className="vitals-grid">
                <div className="vital-input">
                  <label htmlFor="temperature">Temperature (°C)</label>
                  <input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="35"
                    max="42"
                    placeholder="e.g. 37.5"
                    value={vitals.temperature ?? ""}
                    onChange={(e) =>
                      setVitals({
                        ...vitals,
                        temperature: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="vital-input">
                  <label htmlFor="heart-rate">Heart Rate (bpm)</label>
                  <input
                    id="heart-rate"
                    type="number"
                    min="30"
                    max="220"
                    placeholder="e.g. 72"
                    value={vitals.heartRate ?? ""}
                    onChange={(e) =>
                      setVitals({
                        ...vitals,
                        heartRate: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="vital-input">
                  <label htmlFor="bp-systolic">Systolic BP</label>
                  <input
                    id="bp-systolic"
                    type="number"
                    min="60"
                    max="250"
                    placeholder="e.g. 120"
                    value={vitals.systolicBP ?? ""}
                    onChange={(e) =>
                      setVitals({
                        ...vitals,
                        systolicBP: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="vital-input">
                  <label htmlFor="bp-diastolic">Diastolic BP</label>
                  <input
                    id="bp-diastolic"
                    type="number"
                    min="30"
                    max="150"
                    placeholder="e.g. 80"
                    value={vitals.diastolicBP ?? ""}
                    onChange={(e) =>
                      setVitals({
                        ...vitals,
                        diastolicBP: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════ STEP 4: Review & Submit ═════ */}
        {step === 4 && (
          <div className="step-content" key="step-4">
            <h2 className="step-title">Review your information</h2>

            {/* Demographics summary */}
            <div className="review-section">
              <div className="review-header">
                <h4>Demographics</h4>
                <button
                  type="button"
                  className="review-edit"
                  onClick={() => goToStep(1)}
                >
                  Edit
                </button>
              </div>
              <div className="review-row">
                <span className="review-label">Age</span>
                <span className="review-value">{ageRange}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Sex</span>
                <span className="review-value">{sex}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Location</span>
                <span className="review-value">{geography}</span>
              </div>
            </div>

            {/* Symptoms summary */}
            <div className="review-section">
              <div className="review-header">
                <h4>Symptoms</h4>
                <button
                  type="button"
                  className="review-edit"
                  onClick={() => goToStep(2)}
                >
                  Edit
                </button>
              </div>
              <div className="review-chips">
                {selectedSymptoms.map((s) => (
                  <span key={s.symptomCode} className="review-chip">
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Details summary */}
            <div className="review-section">
              <div className="review-header">
                <h4>Severity &amp; Duration</h4>
                <button
                  type="button"
                  className="review-edit"
                  onClick={() => goToStep(3)}
                >
                  Edit
                </button>
              </div>
              {selectedSymptoms.map((s) => (
                <div key={s.symptomCode} className="review-row">
                  <span className="review-label">{s.label}</span>
                  <span className="review-value">
                    {s.severity}/10 · {formatDuration(s.durationHours)}
                  </span>
                </div>
              ))}
            </div>

            {/* Vitals summary (only if entered) */}
            {(vitals.temperature || vitals.heartRate || vitals.systolicBP) && (
              <div className="review-section">
                <div className="review-header">
                  <h4>Vital Signs</h4>
                  <button
                    type="button"
                    className="review-edit"
                    onClick={() => goToStep(3)}
                  >
                    Edit
                  </button>
                </div>
                {vitals.temperature && (
                  <div className="review-row">
                    <span className="review-label">Temperature</span>
                    <span className="review-value">{vitals.temperature}°C</span>
                  </div>
                )}
                {vitals.heartRate && (
                  <div className="review-row">
                    <span className="review-label">Heart Rate</span>
                    <span className="review-value">{vitals.heartRate} bpm</span>
                  </div>
                )}
                {vitals.systolicBP && vitals.diastolicBP && (
                  <div className="review-row">
                    <span className="review-label">Blood Pressure</span>
                    <span className="review-value">
                      {vitals.systolicBP}/{vitals.diastolicBP} mmHg
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="wizard-actions">
          {step > 1 && (
            <button
              type="button"
              className="action-button secondary"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              className="action-button primary"
              onClick={handleNext}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="action-button primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-pulse">Analyzing</span>
              ) : (
                "Get Recommendation"
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
