// Filing status options
export type FilingStatus = "single" | "mfj" | "hoh" | "mfs";

// Tax bracket structure (matches HTML reference format)
export interface TaxBracket {
  upTo: number | null; // null means infinity (top bracket)
  rate: number; // Tax rate as decimal (e.g., 0.22 for 22%)
}

// Job entry for the tables
export interface Job {
  id: string;
  name: string;
  gross: number;
  fed: number;
  state: number;
}

// Calculator settings
export interface CalculatorSettings {
  mode: "top" | "progressive";
  filingStatus: FilingStatus;
  federalTopRate: number;
  stateTopRate: number;
  fedStdDed: number;
  stateStdDed: number;
  otherAdj: number;
  caMhs: boolean; // CA 1% MHS surtax for income > $1M
}

// Complete calculator state for localStorage
export interface CalculatorState {
  settings: CalculatorSettings;
  you: Job[];
  spouse: Job[];
  fedBrackets: Record<FilingStatus, TaxBracket[]>;
  stateBrackets: Record<FilingStatus, TaxBracket[]>;
}

// Per-partner breakdown
export interface PartnerBreakdown {
  gross: number;
  fedWithheld: number;
  stateWithheld: number;
  totalWithheld: number;
  effectiveWithholdingRate: number; // (fed + state withheld) / gross
  fairShareOfTax: number; // proportional share of total tax based on income
  actualContribution: number; // total withheld
  underWithholding: number; // fairShare - actualContribution (positive = under-withheld)
}

// Calculation results
export interface TaxResults {
  totalGross: number;
  totalFedWithheld: number;
  totalStateWithheld: number;
  fedTaxable: number;
  stateTaxable: number;
  fedTax: number;
  stateTax: number;
  fedAdd: number;
  stateAdd: number;
  totalAdd: number;
  // Per-partner breakdown
  you: PartnerBreakdown;
  spouse: PartnerBreakdown;
  effectiveTaxRate: number; // total tax / total gross
}
