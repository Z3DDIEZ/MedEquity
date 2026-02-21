import { useLocation, Link } from "react-router-dom";
import type { TriageResponse } from "../types";

/** Maps care_level strings to display info */
const CARE_LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  emergency: { label: "Emergency", color: "#dc2626", icon: "🚨" },
  urgent_care: { label: "Urgent Care", color: "#ea580c", icon: "⚡" },
  primary_care: { label: "Primary Care", color: "#2563eb", icon: "🏥" },
  telemedicine: { label: "Telemedicine", color: "#7c3aed", icon: "💻" },
  self_care: { label: "Self Care", color: "#16a34a", icon: "🏠" },
};

/**
 * Result display page — shows the triage recommendation with
 * reasoning, red flags, and next steps.
 */
export default function ResultPage() {
  const location = useLocation();
  const result = (location.state as { result?: TriageResponse })?.result;

  if (!result) {
    return (
      <main className="result-page">
        <h1>No Result</h1>
        <p>Please complete a symptom check first.</p>
        <Link to="/triage" className="cta-button">
          Start Symptom Check
        </Link>
      </main>
    );
  }

  const config = CARE_LEVEL_CONFIG[result.careLevel] ?? {
    label: result.careLevel,
    color: "#6b7280",
    icon: "❓",
  };

  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <main className="result-page">
      <h1>Your Recommendation</h1>

      {/* Care Level Card */}
      <div className="care-level-card" style={{ borderColor: config.color }}>
        <span className="care-icon">{config.icon}</span>
        <h2 style={{ color: config.color }}>{config.label}</h2>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${confidencePercent}%`,
              backgroundColor: config.color,
            }}
          />
        </div>
        <p className="confidence-label">Confidence: {confidencePercent}%</p>
      </div>

      {/* Primary Concern */}
      <section className="result-section">
        <h3>Primary Concern</h3>
        <p>{result.primaryConcern}</p>
      </section>

      {/* Reasoning */}
      <section className="result-section">
        <h3>Clinical Reasoning</h3>
        <p>{result.reasoning}</p>
      </section>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <section className="result-section red-flags">
          <h3>Warning Signs to Watch For</h3>
          <ul>
            {result.redFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Next Steps */}
      {result.nextSteps.length > 0 && (
        <section className="result-section next-steps">
          <h3>Recommended Next Steps</h3>
          <ol>
            {result.nextSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Disclaimer */}
      <div className="disclaimer">
        <p>
          <strong>Important:</strong> This is a care-level recommendation, not a
          medical diagnosis. Always consult a healthcare professional for
          medical advice.
        </p>
        <p className="model-version">Model: {result.modelVersion}</p>
      </div>

      <div className="result-actions">
        <Link to="/triage" className="cta-button secondary">
          New Check
        </Link>
        <Link to="/" className="cta-button">
          Home
        </Link>
      </div>
    </main>
  );
}
