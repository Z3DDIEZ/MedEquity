import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import type { TriageResponse } from "../types";

/**
 * WHO-aligned triage color mapping:
 *   Red   = Immediate / Emergency
 *   Amber = Urgent Care
 *   Blue  = Primary Care
 *   Violet = Telemedicine
 *   Green = Self Care / Minor
 */
const CARE_LEVEL_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    bgMuted: string;
    description: string;
    urgencyLabel: string;
  }
> = {
  emergency: {
    label: "Emergency",
    color: "var(--triage-emergency)",
    bgMuted: "var(--triage-emergency-bg)",
    description: "Seek emergency care immediately",
    urgencyLabel: "Seek care now",
  },
  urgent_care: {
    label: "Urgent Care",
    color: "var(--triage-urgent)",
    bgMuted: "var(--triage-urgent-bg)",
    description: "Visit urgent care within a few hours",
    urgencyLabel: "Within 4 hours",
  },
  primary_care: {
    label: "Primary Care",
    color: "var(--triage-primary-care)",
    bgMuted: "var(--triage-primary-care-bg)",
    description: "Schedule a visit with your doctor",
    urgencyLabel: "Within 1–3 days",
  },
  telemedicine: {
    label: "Telemedicine",
    color: "var(--triage-telemedicine)",
    bgMuted: "var(--triage-telemedicine-bg)",
    description: "A virtual consultation is appropriate",
    urgencyLabel: "When convenient",
  },
  self_care: {
    label: "Self Care",
    color: "var(--triage-self-care)",
    bgMuted: "var(--triage-self-care-bg)",
    description: "Manage at home with rest and monitoring",
    urgencyLabel: "Monitor at home",
  },
};

/** SVG ring circumference for confidence animation */
const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

/**
 * Collapsible section component for result details.
 */
function ResultSection({
  title,
  className,
  children,
  defaultOpen = true,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`result-section ${className ?? ""}`}>
      <div className="result-section-header" onClick={() => setOpen(!open)}>
        <h3>{title}</h3>
        <svg
          className={`result-section-toggle ${open ? "open" : ""}`}
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
      </div>
      {open && <div className="result-section-body">{children}</div>}
    </section>
  );
}

/**
 * Result display page — shows the care-level recommendation
 * with confidence ring, urgency timeline, and collapsible detail sections.
 */
export default function ResultPage() {
  const location = useLocation();
  const result = (location.state as { result?: TriageResponse })?.result;

  if (!result) {
    return (
      <main className="result-page">
        <h1>No Result</h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Please complete a symptom check first.
        </p>
        <Link to="/triage" className="cta-button">
          Start Symptom Check
        </Link>
      </main>
    );
  }

  const config = CARE_LEVEL_CONFIG[result.careLevel] ?? {
    label: result.careLevel,
    color: "var(--color-text-secondary)",
    bgMuted: "rgba(255,255,255,0.04)",
    description: "Care level recommendation",
    urgencyLabel: "Consult a professional",
  };

  const confidencePercent = Math.round(result.confidence * 100);
  const ringOffset = RING_C - RING_C * result.confidence;

  return (
    <main className="result-page">
      <h1>Your Recommendation</h1>

      {/* Care Level Card with colored top band */}
      <div className="care-level-card">
        {/* Top color band */}
        <div
          className="care-level-header"
          style={{ background: config.bgMuted }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: config.color,
            }}
          />
          <div
            className="care-icon"
            style={{ background: config.bgMuted, color: config.color }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h2 style={{ color: config.color }}>{config.label}</h2>
          <p className="care-description">{config.description}</p>

          {/* Urgency timeline badge */}
          <div className="urgency-timeline" style={{ color: config.color }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {config.urgencyLabel}
          </div>
        </div>

        <div className="care-level-body">
          {/* Confidence ring */}
          <div className="confidence-ring">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle
                className="confidence-ring-bg"
                cx="36"
                cy="36"
                r={RING_R}
              />
              <circle
                className="confidence-ring-fill"
                cx="36"
                cy="36"
                r={RING_R}
                stroke={config.color}
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span
              className="confidence-ring-text"
              style={{ color: config.color }}
            >
              {confidencePercent}%
            </span>
          </div>
          <p className="confidence-label">Confidence</p>
        </div>
      </div>

      {/* Collapsible detail sections */}
      <ResultSection title="Primary Concern">
        <p>{result.primaryConcern}</p>
      </ResultSection>

      <ResultSection title="Clinical Reasoning">
        <p>{result.reasoning}</p>
      </ResultSection>

      {result.redFlags.length > 0 && (
        <ResultSection title="Warning Signs to Watch For" className="red-flags">
          <ul>
            {result.redFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </ResultSection>
      )}

      {result.nextSteps.length > 0 && (
        <ResultSection title="Recommended Next Steps" className="next-steps">
          <ol>
            {result.nextSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </ResultSection>
      )}

      {/* Disclaimer */}
      <div className="disclaimer">
        <svg
          className="disclaimer-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div>
          <p>
            <strong>Important:</strong> This is a care-level recommendation, not
            a medical diagnosis. Always consult a healthcare professional for
            medical advice.
          </p>
          <p className="model-version">Model: {result.modelVersion}</p>
        </div>
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
