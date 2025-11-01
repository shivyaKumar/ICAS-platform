export type ComplianceSummary = {
  name: string;
  yes: number;
  partially: number;
  no: number;
  compliancePercent: number;
};

export type BranchCompliance = {
  branchName: string;
  divisionName: string;
  yes: number;
  partially: number;
  no: number;
  compliancePercent: number;
};

export type ComplianceTrendPoint = {
  month: number; // 1-12
  compliancePercent: number;
};

export type DivisionComplianceHierarchy = {
  divisions: Array<{
    division: string;
    compliancePercent: number;
    branches: Array<{
      branch: string;
      compliancePercent: number;
      frameworks: Array<{
        framework: string;
        compliancePercent: number;
      }>;
    }>;
  }>;
};

export type DivisionStackDatum = {
  name: string;
  compliant: number;
  partially: number;
  nonCompliant: number;
  compliancePercent: number;
};

export type BranchStackDatum = {
  name: string;
  compliant: number;
  partially: number;
  nonCompliant: number;
  compliancePercent: number;
};
