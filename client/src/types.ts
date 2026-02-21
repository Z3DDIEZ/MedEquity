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

export interface TriageRequest {
  ageRange: string;
  sex: string;
  geography: string;
  symptoms: SymptomEntry[];
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

/** Common symptoms with SNOMED CT codes for the intake form */
export const COMMON_SYMPTOMS: { code: string; label: string }[] = [
  { code: "386661006", label: "Fever" },
  { code: "49727002", label: "Cough" },
  { code: "25064002", label: "Headache" },
  { code: "267036007", label: "Shortness of Breath" },
  { code: "422587007", label: "Nausea" },
  { code: "21522001", label: "Abdominal Pain" },
  { code: "162397003", label: "Chest Pain" },
  { code: "271807003", label: "Skin Rash" },
  { code: "84229001", label: "Fatigue" },
  { code: "68962001", label: "Muscle Pain" },
  { code: "162076009", label: "Sore Throat" },
  { code: "3006004", label: "Dizziness" },
];
