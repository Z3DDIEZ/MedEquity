/**
 * API client for the MedEquity triage service.
 */
import type { TriageRequest, TriageResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function analyzeSymptoms(
  request: TriageRequest,
): Promise<TriageResponse> {
  const response = await fetch(`${API_BASE}/api/triage/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Triage API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
