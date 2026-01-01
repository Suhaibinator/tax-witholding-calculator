import type { TaxBracket, Job, CalculatorSettings, TaxResults, PartnerBreakdown } from "./types";
import { CA_MHS_THRESHOLD, CA_MHS_RATE } from "./constants";

/**
 * Calculate tax using progressive brackets.
 * Matches the HTML reference implementation.
 */
export function computeProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  let tax = 0;
  let prev = 0;
  const income = Math.max(0, taxableIncome);

  for (const b of brackets) {
    const upTo = b.upTo === null ? null : Number(b.upTo);
    const rate = Number(b.rate);

    if (!Number.isFinite(rate) || rate < 0) continue;

    if (upTo === null) {
      // Top bracket - tax all remaining income
      tax += Math.max(0, income - prev) * rate;
      break;
    } else {
      const slice = Math.max(0, Math.min(income, upTo) - prev);
      tax += slice * rate;
      prev = upTo;
      if (income <= upTo) break;
    }
  }

  return tax;
}

/**
 * Calculate tax using top rate (worst-case scenario).
 */
export function computeTopRateTax(
  taxableIncome: number,
  topRate: number
): number {
  return Math.max(0, taxableIncome) * topRate;
}

/**
 * Parse a number, returning 0 for invalid values.
 */
export function parseNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Main tax calculation function.
 */
export function calculateTaxes(
  settings: CalculatorSettings,
  you: Job[],
  spouse: Job[],
  fedBrackets: TaxBracket[],
  stateBrackets: TaxBracket[]
): TaxResults {
  const allRows = [...you, ...spouse];

  // Calculate totals
  const totalGross = allRows.reduce((s, r) => s + parseNum(r.gross), 0);
  const totalFedWithheld = allRows.reduce((s, r) => s + parseNum(r.fed), 0);
  const totalStateWithheld = allRows.reduce((s, r) => s + parseNum(r.state), 0);

  // Calculate taxable income
  const fedTaxable = Math.max(0, totalGross - settings.fedStdDed - settings.otherAdj);
  const stateTaxable = Math.max(0, totalGross - settings.stateStdDed - settings.otherAdj);

  // Calculate taxes
  let fedTax = 0;
  let stateTax = 0;

  if (settings.mode === "top") {
    fedTax = computeTopRateTax(fedTaxable, settings.federalTopRate);
    stateTax = computeTopRateTax(stateTaxable, settings.stateTopRate);
  } else {
    fedTax = computeProgressiveTax(fedTaxable, fedBrackets);
    stateTax = computeProgressiveTax(stateTaxable, stateBrackets);
  }

  // Add CA MHS surtax if applicable
  if (settings.caMhs) {
    stateTax += Math.max(0, stateTaxable - CA_MHS_THRESHOLD) * CA_MHS_RATE;
  }

  // Calculate additional amounts needed
  const fedAdd = Math.max(0, fedTax - totalFedWithheld);
  const stateAdd = Math.max(0, stateTax - totalStateWithheld);
  const totalAdd = fedAdd + stateAdd;

  // Total tax liability
  const totalTax = fedTax + stateTax;
  const effectiveTaxRate = totalGross > 0 ? totalTax / totalGross : 0;

  // Per-partner breakdown
  const computePartnerBreakdown = (jobs: Job[]): PartnerBreakdown => {
    const gross = jobs.reduce((s, r) => s + parseNum(r.gross), 0);
    const fedWithheld = jobs.reduce((s, r) => s + parseNum(r.fed), 0);
    const stateWithheld = jobs.reduce((s, r) => s + parseNum(r.state), 0);
    const totalWithheld = fedWithheld + stateWithheld;

    // Effective withholding rate for this partner
    const effectiveWithholdingRate = gross > 0 ? totalWithheld / gross : 0;

    // Fair share of total tax (proportional to income contribution)
    const incomeShare = totalGross > 0 ? gross / totalGross : 0;
    const fairShareOfTax = totalTax * incomeShare;

    // How much they actually contributed vs their fair share
    const actualContribution = totalWithheld;
    const underWithholding = fairShareOfTax - actualContribution;

    return {
      gross,
      fedWithheld,
      stateWithheld,
      totalWithheld,
      effectiveWithholdingRate,
      fairShareOfTax,
      actualContribution,
      underWithholding,
    };
  };

  return {
    totalGross,
    totalFedWithheld,
    totalStateWithheld,
    fedTaxable,
    stateTaxable,
    fedTax,
    stateTax,
    fedAdd,
    stateAdd,
    totalAdd,
    you: computePartnerBreakdown(you),
    spouse: computePartnerBreakdown(spouse),
    effectiveTaxRate,
  };
}

/**
 * Try to parse brackets from JSON string.
 * Returns null if invalid.
 */
export function tryParseBrackets(text: string): TaxBracket[] | null {
  try {
    const val = JSON.parse(text);
    if (!Array.isArray(val)) return null;

    return val.map((b) => ({
      upTo: b.upTo === null ? null : Number(b.upTo),
      rate: Number(b.rate),
    }));
  } catch {
    return null;
  }
}
