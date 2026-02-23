import { Link } from "react-router-dom";

/**
 * Landing page — introduces MedEquity with trust indicators,
 * a "How It Works" flow, and feature cards.
 */
export default function HomePage() {
  return (
    <main className="home-page">
      {/* Privacy banner */}
      <div className="privacy-banner">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Your data is never stored or transmitted beyond this session
      </div>

      <div className="hero">
        <h1>MedEquity</h1>
        <p className="subtitle">Federated Healthcare Triage Assistant</p>
        <p className="description">
          Get a care-level recommendation based on your symptoms. We guide you
          to the right care setting — <strong>we never diagnose</strong>.
        </p>
        <Link to="/triage" className="cta-button">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Start Symptom Check
        </Link>

        <div className="trust-row">
          <span className="trust-item">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            WHO-aligned protocols
          </span>
          <span className="trust-item">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            POPIA compliant
          </span>
          <span className="trust-item">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Auto-deleted in 7 days
          </span>
        </div>
      </div>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-row">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <h3>Describe Symptoms</h3>
            <p>
              Select your symptoms and rate their severity through a guided
              intake form.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-number">2</div>
            <h3>AI Analysis</h3>
            <p>
              Our clinically-aligned model analyzes your symptoms against triage
              protocols.
            </p>
          </div>
          <div className="how-step">
            <div className="how-step-number">3</div>
            <h3>Care Recommendation</h3>
            <p>
              Receive a recommendation for the appropriate level of care with
              clear reasoning.
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="info-cards">
        <div className="card">
          <div className="card-icon privacy">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3>Privacy First</h3>
          <p>
            No patient identifiers are transmitted. Data is ephemeral and
            auto-deleted per POPIA requirements.
          </p>
        </div>
        <div className="card">
          <div className="card-icon ai">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3>AI-Assisted</h3>
          <p>
            Powered by Gemini with structured clinical reasoning, designed for
            healthcare professional review.
          </p>
        </div>
        <div className="card">
          <div className="card-icon equity">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
            </svg>
          </div>
          <h3>Fair &amp; Equitable</h3>
          <p>
            Built with multi-stakeholder governance and fairness metrics to
            reduce health disparities.
          </p>
        </div>
      </section>
    </main>
  );
}
