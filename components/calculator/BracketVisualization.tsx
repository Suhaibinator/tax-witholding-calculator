"use client";

import type { TaxBracket } from "@/lib/types";
import { formatCurrencyCompact, formatPercent } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface BracketVisualizationProps {
  brackets: TaxBracket[];
  taxableIncome: number;
  label: string;
  withheld: number;
  estimatedTax: number;
}

/** Compact dollar display: $0, $12K, $197K, $1.2M */
function fmtCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `$${Math.round(n / 1_000)}K`;
  }
  return `$${Math.round(n)}`;
}

export function BracketVisualization({
  brackets,
  taxableIncome,
  label,
  withheld,
  estimatedTax,
}: BracketVisualizationProps) {
  if (brackets.length === 0) return null;

  // Build segment data from ordered brackets
  const segments = brackets.map((bracket, i) => {
    const floor = i === 0 ? 0 : (brackets[i - 1].upTo ?? 0);
    const ceiling = bracket.upTo;
    const rate = bracket.rate;
    return { floor, ceiling, rate };
  });

  // Cap the top bracket's display width at the largest finite bracket width
  const finiteWidths = segments
    .filter((s) => s.ceiling !== null)
    .map((s) => s.ceiling! - s.floor);
  const maxFiniteWidth =
    finiteWidths.length > 0 ? Math.max(...finiteWidths) : 100_000;

  const displayWidths = segments.map((s) =>
    s.ceiling !== null ? s.ceiling - s.floor : maxFiniteWidth
  );

  // Sqrt-scaled heights
  const sqrtWidths = displayWidths.map((w) => Math.sqrt(Math.max(w, 1)));
  const totalSqrt = sqrtWidths.reduce((a, b) => a + b, 0);
  const TOTAL_HEIGHT = 320;
  const MIN_HEIGHT = 32;

  let heights = sqrtWidths.map((sw) => (sw / totalSqrt) * TOTAL_HEIGHT);
  heights = heights.map((h) => Math.max(h, MIN_HEIGHT));
  const actualTotal = heights.reduce((a, b) => a + b, 0);
  heights = heights.map((h) => (h / actualTotal) * TOTAL_HEIGHT);

  // Fill percentages
  const fills = segments.map((seg) => {
    if (seg.ceiling === null) {
      return taxableIncome > seg.floor
        ? Math.min(1, (taxableIncome - seg.floor) / maxFiniteWidth)
        : 0;
    }
    if (taxableIncome >= seg.ceiling) return 1;
    if (taxableIncome > seg.floor)
      return (taxableIncome - seg.floor) / (seg.ceiling - seg.floor);
    return 0;
  });

  // Marginal rate: rate of the bracket where income currently sits
  let marginalRate = 0;
  if (taxableIncome > 0) {
    for (let i = 0; i < segments.length; i++) {
      marginalRate = segments[i].rate;
      if (
        segments[i].ceiling === null ||
        taxableIncome <= segments[i].ceiling!
      ) {
        break;
      }
    }
  }

  // Build render data (reversed: highest bracket at top of DOM)
  const renderData = segments
    .map((seg, i) => ({
      ...seg,
      height: heights[i],
      fill: fills[i],
      isActive: fills[i] > 0 && fills[i] < 1,
      isFull: fills[i] >= 1,
    }))
    .reverse();

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="w-full border-2 border-gray-300 rounded-sm overflow-hidden">
        {renderData.map((seg) => {
          const pct = Math.round(seg.rate * 1000) / 10;
          const rateLabel = `${Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1)}%`;
          const rangeLabel =
            seg.ceiling !== null
              ? `${fmtCompact(seg.floor)}\u2013${fmtCompact(seg.ceiling)}`
              : `${fmtCompact(seg.floor)}+`;

          return (
            <div
              key={`${seg.rate}-${seg.floor}`}
              className={cn(
                "relative w-full border-b border-gray-200 last:border-b-0",
                seg.isActive && "z-10 ring-1 ring-inset ring-blue-400"
              )}
              style={{ height: seg.height }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gray-100" />

              {/* Blue fill from bottom */}
              {seg.fill > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-200"
                  style={{ height: `${seg.fill * 100}%` }}
                />
              )}

              {/* Water line for active bracket */}
              {seg.isActive && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-blue-500"
                  style={{ bottom: `${seg.fill * 100}%` }}
                />
              )}

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    seg.isActive
                      ? "text-blue-700"
                      : seg.isFull
                        ? "text-blue-900/70"
                        : "text-gray-400"
                  )}
                >
                  {rateLabel}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-tight",
                    seg.isActive
                      ? "text-blue-600"
                      : seg.isFull
                        ? "text-blue-800/50"
                        : "text-gray-400"
                  )}
                >
                  {rangeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div className="mt-2 text-center space-y-0.5">
        <p className="text-xs text-muted-foreground">
          Taxable:{" "}
          <span className="font-mono font-medium text-foreground">
            {formatCurrencyCompact(taxableIncome)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Marginal Rate:{" "}
          <span className="font-mono font-medium text-foreground">
            {formatPercent(marginalRate)}
          </span>
        </p>
        <hr className="my-1 border-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">
          Withheld:{" "}
          <span className="font-mono font-medium text-foreground">
            {formatCurrencyCompact(withheld)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Estimated Tax:{" "}
          <span className="font-mono font-medium text-foreground">
            {formatCurrencyCompact(estimatedTax)}
          </span>
        </p>
        {(() => {
          const additional = Math.max(0, estimatedTax - withheld);
          const onTrack = additional <= 0;
          return (
            <p className="text-xs text-muted-foreground">
              Additional:{" "}
              <span
                className={cn(
                  "font-mono font-medium",
                  onTrack ? "text-green-600" : "text-red-600"
                )}
              >
                {onTrack ? "On track" : formatCurrencyCompact(additional)}
              </span>
            </p>
          );
        })()}
      </div>
    </div>
  );
}
