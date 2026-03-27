import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SYMPTOM_CATEGORIES,
  DURATION_PRESETS,
  BODY_REGION_SYMPTOM_MAP,
  formatDuration,
} from "../types";
import type { SymptomEntry, VitalSigns, BodyRegion } from "../types";
import { analyzeSymptoms } from "../api";
import HumanBodyMap from "../components/human-body-map";

/* ── Animation variants ── */

const panelVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.15 } },
};

/**
 * Determines the ambient glow CSS color based on the maximum
 * severity value across all selected symptoms.
 *
 * @param symptoms - The currently selected symptoms with severity values.
 * @returns A CSS rgba string for the ambient glow overlay.
 */
function getAmbientGlow(symptoms: SymptomEntry[]): string {
  if (symptoms.length === 0) return "rgba(45, 212, 191, 0.04)";
  const maxSeverity = Math.max(...symptoms.map((s) => s.severity));
  if (maxSeverity <= 3) return "rgba(34, 197, 94, 0.06)";
  if (maxSeverity <= 6) return "rgba(245, 158, 11, 0.06)";
  return "rgba(239, 68, 68, 0.07)";
}

/**
 * Severity color class based on value.
 */
function severityClass(val: number): string {
  if (val <= 3) return "severity-low";
  if (val <= 6) return "severity-medium";
  return "severity-high";
}

/**
 * MedEquity Triage Dashboard — Hybrid Glassmorphic UI.
 *
 * Single-page layout with:
 *   - Compact demographics row
 *   - Interactive body map + searchable symptom chips
 *   - Severity / duration sliders with ambient glow
 *   - Floating "Analyze" FAB
 */
export default function TriagePage(): React.JSX.Element {
  const navigate = useNavigate();

  /* ── Demographics state ── */
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [geography, setGeography] = useState("");

  /* ── Symptom state ── */
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<BodyRegion | null>(null);

  /* ── Vitals state ── */
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [showVitals, setShowVitals] = useState(false);

  /* ── UI state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Symptom helpers ── */

  function toggleSymptom(code: string, label: string): void {
    setSelectedSymptoms((prev) => {
      const exists = prev.find((s) => s.symptomCode === code);
      if (exists) return prev.filter((s) => s.symptomCode !== code);
      return [
        ...prev,
        { symptomCode: code, severity: 5, durationHours: 24, label },
      ];
    });
  }

  function updateSeverity(code: string, severity: number): void {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomCode === code ? { ...s, severity } : s)),
    );
  }

  function updateDuration(code: string, durationHours: number): void {
    setSelectedSymptoms((prev) =>
      prev.map((s) => (s.symptomCode === code ? { ...s, durationHours } : s)),
    );
  }

  function removeSymptom(code: string): void {
    setSelectedSymptoms((prev) => prev.filter((s) => s.symptomCode !== code));
  }

  /* ── Filtered symptoms (body region + search) ── */

  const filteredCategories = useMemo(() => {
    let cats = SYMPTOM_CATEGORIES;

    // Filter by body region
    if (activeRegion) {
      const regionCodes = BODY_REGION_SYMPTOM_MAP[activeRegion];
      cats = cats
        .map((cat) => ({
          ...cat,
          symptoms: cat.symptoms.filter((s) => regionCodes.includes(s.code)),
        }))
        .filter((cat) => cat.symptoms.length > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          symptoms: cat.symptoms.filter((s) =>
            s.label.toLowerCase().includes(q),
          ),
        }))
        .filter((cat) => cat.symptoms.length > 0);
    }

    return cats;
  }, [searchQuery, activeRegion]);

  /* ── Validation ── */

  function validate(): string | null {
    if (!ageRange || !sex || !geography) {
      return "Please fill in all demographic fields above.";
    }
    if (selectedSymptoms.length === 0) {
      return "Please select at least one symptom.";
    }
    return null;
  }

  /* ── Submit ── */

  async function handleSubmit(): Promise<void> {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
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

  /* ── Ambient glow color ── */
  const ambientGlow = getAmbientGlow(selectedSymptoms);

  /* ── Render ── */

  return (
    <main className="triage-dashboard">
      {/* Ambient background glow */}
      <div
        className="triage-ambient"
        style={{ background: `radial-gradient(ellipse at 50% 20%, ${ambientGlow}, transparent 70%)` }}
      />

      {/* Header */}
      <header className="triage-header">
        <h1>Symptom Check</h1>
        <p className="triage-subtitle">
          Describe your symptoms and we'll recommend the right care setting.
        </p>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SECTION 1: Demographics (compact row) ═══ */}
      <motion.section
        className="triage-section glass-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="section-label">Your Information</h2>
        <div className="demographics-row">
          <div className="input-group">
            <label htmlFor="age-range">Age Range</label>
            <select
              id="age-range"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            >
              <option value="">Select...</option>
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
            <label htmlFor="geography">Location</label>
            <select
              id="geography"
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
          </div>
        </div>
      </motion.section>

      {/* ═══ SECTION 2: Symptom Selection (body map + chips) ═══ */}
      <motion.section
        className="triage-section glass-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <h2 className="section-label">What are your symptoms?</h2>

        <div className="symptom-explorer">
          {/* Left: body map */}
          <div className="symptom-explorer-left">
            <HumanBodyMap
              activeRegion={activeRegion}
              onRegionSelect={setActiveRegion}
            />
          </div>

          {/* Right: search + symptom chips */}
          <div className="symptom-explorer-right">
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
            <div className="symptom-chip-area">
              {filteredCategories.map((cat) => (
                <div key={cat.category} className="symptom-category">
                  <div className="category-label">{cat.category}</div>
                  <div className="symptom-grid">
                    <AnimatePresence mode="popLayout">
                      {cat.symptoms.map((symptom) => {
                        const isSelected = selectedSymptoms.some(
                          (s) => s.symptomCode === symptom.code,
                        );
                        return (
                          <motion.button
                            key={symptom.code}
                            layout
                            variants={chipVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            type="button"
                            className={`symptom-chip ${isSelected ? "selected" : ""}`}
                            onClick={() =>
                              toggleSymptom(symptom.code, symptom.label)
                            }
                          >
                            {symptom.label}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <p className="empty-state">
                  No symptoms match your{" "}
                  {activeRegion ? "body region" : "search"}.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ SECTION 3: Selected symptoms severity / duration ═══ */}
      <AnimatePresence>
        {selectedSymptoms.length > 0 && (
          <motion.section
            className="triage-section glass-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2 className="section-label">
              How severe are they?
              <span className="section-badge">{selectedSymptoms.length}</span>
            </h2>

            {selectedSymptoms.map((symptom) => (
              <motion.div
                key={symptom.symptomCode}
                className="symptom-detail"
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
              >
                <div className="symptom-detail-header">
                  <h4>{symptom.label}</h4>
                  <button
                    type="button"
                    className="remove-symptom"
                    onClick={() => removeSymptom(symptom.symptomCode)}
                    aria-label={`Remove ${symptom.label ?? "symptom"}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Severity slider */}
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

                {/* Duration slider + presets */}
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
                  <div className="duration-presets">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        className={`duration-preset ${symptom.durationHours === p.value ? "selected" : ""}`}
                        onClick={() =>
                          updateDuration(symptom.symptomCode, p.value)
                        }
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ SECTION 4: Optional Vitals ═══ */}
      <motion.section
        className="triage-section glass-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <button
          type="button"
          className="vitals-toggle"
          onClick={() => setShowVitals(!showVitals)}
        >
          <h2 className="section-label" style={{ marginBottom: 0 }}>
            Vital Signs
            <span className="section-optional">Optional</span>
          </h2>
          <svg
            className={`vitals-chevron ${showVitals ? "open" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AnimatePresence>
          {showVitals && (
            <motion.div
              className="vitals-grid"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ═══ Floating Analyze Button ═══ */}
      <motion.button
        className="analyze-fab"
        onClick={handleSubmit}
        disabled={loading}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        {loading ? (
          <span className="loading-pulse">Analyzing</span>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Get Recommendation
          </>
        )}
      </motion.button>
    </main>
  );
}
