// src/lib/assessments.ts
// Shared types and helper functions for assessments

// -----------------------------
// Types
// -----------------------------
export type ComplianceStatus =
  | "Compliant"
  | "Not Compliant"
  | "In Progress"
  | "N/A";

export type ReviewOutcome =
  | "Approved"
  | "Rejected"
  | "Changes Requested";

export type ControlRow = {
  id: string;                  // Control ID (e.g., "A.5.1.1")
  name: string;                // Control name
  complianceStatus: ComplianceStatus;  // Set by division staff
  implementation?: string;     // Staff input
  gapDescription?: string;     // Notes on missing compliance
  assignedTo?: string;         // User assigned
  evidenceUrl?: string;        // File link
  reviewOutcome?: ReviewOutcome;       // Set by reviewer
  reviewerComments?: string;   // Notes from reviewer
  reviewDate?: string;         // ISO date string
};

export type AssessmentHeader = {
  id: string;
  framework: string;           // "ISO 27001", "NIST CSF", "GDPR"
  division: string;            // e.g., "Finance"
  createdAt: string;           // ISO date
  status: "Current" | "Completed";
};

export type CurrentAssessment = AssessmentHeader & {
  controls: ControlRow[];
};

export type CompletedAssessment = AssessmentHeader & {
  completedAt: string;         // ISO date when completed
  controls: ControlRow[];      // Includes both complianceStatus + reviewOutcome
};

// -----------------------------
// Helper Functions
// -----------------------------

/**
 * Map compliance status to a color (for UI pills).
 */
export function getComplianceColor(status: ComplianceStatus): string {
  switch (status) {
    case "Compliant": return "bg-green-600 text-white";
    case "Not Compliant": return "bg-red-600 text-white";
    case "In Progress": return "bg-yellow-600 text-white";
    case "N/A": return "bg-gray-400 text-white";
    default: return "bg-slate-500 text-white";
  }
}

/**
 * Map review outcome to a color (for UI pills).
 */
export function getOutcomeColor(outcome?: ReviewOutcome): string {
  switch (outcome) {
    case "Approved": return "bg-green-700 text-white";
    case "Rejected": return "bg-red-700 text-white";
    case "Changes Requested": return "bg-orange-600 text-white";
    default: return "bg-slate-500 text-white";
  }
}

/**
 * Calculate compliance percentage for an assessment.
 * Based on how many controls are marked "Compliant".
 */
export function calculateCompliancePercentage(controls: ControlRow[]): number {
  if (!controls.length) return 0;
  const compliantCount = controls.filter(c => c.complianceStatus === "Compliant").length;
  return Math.round((compliantCount / controls.length) * 100);
}
