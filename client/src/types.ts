/**
 * Shared types for the MedEquity triage API.
 * Matches the gRPC contract and .NET DTOs.
 */

export interface SymptomEntry {
  symptomCode: string;
  severity: number;
  durationHours: number;
  label?: string;
}

export interface VitalSigns {
  temperature?: number;
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
}

export interface TriageRequest {
  ageRange: string;
  sex: string;
  geography: string;
  symptoms: SymptomEntry[];
  vitalSigns?: VitalSigns;
}

export interface TriageResponse {
  status: string;
  careLevel: string;
  confidence: number;
  primaryConcern: string;
  reasoning: string;
  redFlags: string[];
  nextSteps: string[];
  modelVersion: string;
}

/** Symptom categories for grouped display */
export const SYMPTOM_CATEGORIES: {
  category: string;
  symptoms: { code: string; label: string }[];
}[] = [
  {
    category: "Respiratory",
    symptoms: [
      { code: "49727002", label: "Cough" },
      { code: "267036007", label: "Shortness of Breath" },
      { code: "162076009", label: "Sore Throat" },
    ],
  },
  {
    category: "Pain",
    symptoms: [
      { code: "25064002", label: "Headache" },
      { code: "162397003", label: "Chest Pain" },
      { code: "21522001", label: "Abdominal Pain" },
      { code: "68962001", label: "Muscle Pain" },
    ],
  },
  {
    category: "General",
    symptoms: [
      { code: "386661006", label: "Fever" },
      { code: "84229001", label: "Fatigue" },
      { code: "3006004", label: "Dizziness" },
    ],
  },
  {
    category: "Other",
    symptoms: [
      { code: "422587007", label: "Nausea" },
      { code: "271807003", label: "Skin Rash" },
    ],
  },
];

/** Flat list for backwards compatibility */
export const COMMON_SYMPTOMS: { code: string; label: string }[] =
  SYMPTOM_CATEGORIES.flatMap((cat) => cat.symptoms);

/** Human-readable duration presets */
export const DURATION_PRESETS: { value: number; label: string }[] = [
  { value: 2, label: "A couple hours" },
  { value: 6, label: "Half a day" },
  { value: 24, label: "About a day" },
  { value: 48, label: "1–2 days" },
  { value: 72, label: "About 3 days" },
  { value: 120, label: "About 5 days" },
  { value: 168, label: "About a week" },
];

/**
 * Returns human-readable duration from hours.
 */
export function formatDuration(hours: number): string {
  if (hours <= 1) return "< 1 hour";
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}
