import { Link } from "react-router-dom";

/**
 * Landing page — introduces MedEquity and directs users to the triage flow.
 */
export default function HomePage() {
  return (
    <main className="home-page">
      <div className="hero">
        <h1>MedEquity</h1>
        <p className="subtitle">Federated Healthcare Triage Assistant</p>
        <p className="description">
          Get a care-level recommendation based on your symptoms.
          <br />
          <strong>
            We never diagnose — we guide you to the right care setting.
          </strong>
        </p>
        <Link to="/triage" className="cta-button">
          Start Symptom Check
        </Link>
      </div>

      <section className="info-cards">
        <div className="card">
          <h3>🔒 Privacy First</h3>
          <p>
            Your data never leaves the local system. Auto-deleted after 7 days.
          </p>
        </div>
        <div className="card">
          <h3>🤖 AI-Assisted</h3>
          <p>Powered by Gemini, reviewed by healthcare professionals.</p>
        </div>
        <div className="card">
          <h3>⚖️ Fair & Equitable</h3>
          <p>Built with fairness metrics to reduce health disparities.</p>
        </div>
      </section>
    </main>
  );
}
