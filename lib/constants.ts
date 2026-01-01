import type { FilingStatus, TaxBracket, CalculatorSettings } from "./types";

// 2025 Federal Tax Brackets
// Source: https://taxfoundation.org/data/all/federal/2025-tax-brackets/
export const DEFAULT_FEDERAL_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { upTo: 11925, rate: 0.1 },
    { upTo: 48475, rate: 0.12 },
    { upTo: 103350, rate: 0.22 },
    { upTo: 197300, rate: 0.24 },
    { upTo: 250525, rate: 0.32 },
    { upTo: 626350, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  mfj: [
    { upTo: 23850, rate: 0.1 },
    { upTo: 96950, rate: 0.12 },
    { upTo: 206700, rate: 0.22 },
    { upTo: 394600, rate: 0.24 },
    { upTo: 501050, rate: 0.32 },
    { upTo: 751600, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  hoh: [
    { upTo: 17000, rate: 0.1 },
    { upTo: 64850, rate: 0.12 },
    { upTo: 103350, rate: 0.22 },
    { upTo: 197300, rate: 0.24 },
    { upTo: 250500, rate: 0.32 },
    { upTo: 626350, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  mfs: [
    { upTo: 11925, rate: 0.1 },
    { upTo: 48475, rate: 0.12 },
    { upTo: 103350, rate: 0.22 },
    { upTo: 197300, rate: 0.24 },
    { upTo: 250525, rate: 0.32 },
    { upTo: 375800, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
};

// 2025 California Tax Brackets
// Source: https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf
export const DEFAULT_CA_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { upTo: 11079, rate: 0.01 },
    { upTo: 26264, rate: 0.02 },
    { upTo: 41452, rate: 0.04 },
    { upTo: 57542, rate: 0.06 },
    { upTo: 72724, rate: 0.08 },
    { upTo: 371479, rate: 0.093 },
    { upTo: 445771, rate: 0.103 },
    { upTo: 742953, rate: 0.113 },
    { upTo: null, rate: 0.123 },
  ],
  mfj: [
    { upTo: 22158, rate: 0.01 },
    { upTo: 52528, rate: 0.02 },
    { upTo: 82904, rate: 0.04 },
    { upTo: 115084, rate: 0.06 },
    { upTo: 145448, rate: 0.08 },
    { upTo: 742958, rate: 0.093 },
    { upTo: 891542, rate: 0.103 },
    { upTo: 1485906, rate: 0.113 },
    { upTo: null, rate: 0.123 },
  ],
  hoh: [
    { upTo: 22173, rate: 0.01 },
    { upTo: 52530, rate: 0.02 },
    { upTo: 67716, rate: 0.04 },
    { upTo: 83805, rate: 0.06 },
    { upTo: 98990, rate: 0.08 },
    { upTo: 505208, rate: 0.093 },
    { upTo: 606251, rate: 0.103 },
    { upTo: 1010417, rate: 0.113 },
    { upTo: null, rate: 0.123 },
  ],
  mfs: [
    { upTo: 11079, rate: 0.01 },
    { upTo: 26264, rate: 0.02 },
    { upTo: 41452, rate: 0.04 },
    { upTo: 57542, rate: 0.06 },
    { upTo: 72724, rate: 0.08 },
    { upTo: 371479, rate: 0.093 },
    { upTo: 445771, rate: 0.103 },
    { upTo: 742953, rate: 0.113 },
    { upTo: null, rate: 0.123 },
  ],
};

// Federal standard deductions for 2025
export const FEDERAL_STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 15000,
  mfj: 30000,
  hoh: 22500,
  mfs: 15000,
};

// CA standard deductions
export const CA_STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 5540,
  mfj: 11080,
  hoh: 11080,
  mfs: 5540,
};

// Filing status labels for display
export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  mfj: "Married Filing Jointly",
  hoh: "Head of Household",
  mfs: "Married Filing Separately",
};

// CA MHS (Mental Health Services) surtax threshold and rate
export const CA_MHS_THRESHOLD = 1_000_000;
export const CA_MHS_RATE = 0.01;

// Default settings
export const DEFAULT_SETTINGS: CalculatorSettings = {
  mode: "progressive",
  filingStatus: "mfj",
  federalTopRate: 0.37,
  stateTopRate: 0.123,
  fedStdDed: FEDERAL_STANDARD_DEDUCTIONS.mfj,
  stateStdDed: CA_STANDARD_DEDUCTIONS.mfj,
  otherAdj: 0,
  caMhs: false,
};

// localStorage key
export const STORAGE_KEY = "tax-calculator-state";
