/* -----------------------------------------------------------
   ICAS-P Shared Type Definitions (Frontend <-> Backend)
   ----------------------------------------------------------- */

/* ---------- Evidence (File Upload Metadata) ---------- */
export interface Evidence {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

/* ---------- Control Finding ---------- */
export interface Finding {
  id: number;
  code: string;
  title: string;
  description: string;
  domain: string;
  status: string;                 // "In Progress" | "Approved" | "Rejected"
  compliance: string;             // "Yes" | "No" | "Partially" | "N/A"
  evidenceRequired: boolean;
  evidences?: Evidence[];
  evidenceNote?: string;
  comments?: string;
  review?: string;                // Used in review mode
  assignedTo?: string;
  createdBy?: string;
  modifiedDate?: string;
}

/* ---------- Assessment (Parent Record) ---------- */
export interface Assessment {
  id: number;
  framework: string;
  division: string;
  branch: string;
  location: string;
  createdBy: string;
  createdAt: string;
  modifiedDate?: string;
  assessmentScope?: string;
  assessmentDate?: string;
  dueDate?: string;
  progressRate?: number;
  status?: string;                // Optional because progress determines completion
  findings: Finding[];
}
