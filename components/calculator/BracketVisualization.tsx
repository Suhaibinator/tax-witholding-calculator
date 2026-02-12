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

// Warm tonal bracket palette — from amber to deep rose
const BRACKET_COLORS = [
  { fill: "#fef3c7", active: "#f59e0b", text: "#92400e" },   // amber-100
  { fill: "#fde68a", active: "#f59e0b", text: "#92400e" },   // amber-200
  { fill: "#fed7aa", active: "#ea580c", text: "#9a3412" },   // orange-200
  { fill: "#fdba74", active: "#ea580c", text: "#9a3412" },   // orange-300
  { fill: "#fca5a5", active: "#dc2626", text: "#991b1b" },   // red-300
  { fill: "#f87171", active: "#dc2626", text: "#991b1b" },   // red-400
  { fill: "#e879f9", active: "#a855f7", text: "#6b21a8" },   // fuchsia-400
  { fill: "#c084fc", active: "#7c3aed", text: "#5b21b6" },   // purple-400
  { fill: "#a78bfa", active: "#6d28d9", text: "#4c1d95" },   // violet-400
  { fill: "#818cf8", active: "#4f46e5", text: "#3730a3" },   // indigo-400
  { fill: "#93c5fd", active: "#3b82f6", text: "#1e40af" },   // blue-300
  { fill: "#7dd3fc", active: "#0ea5e9", text: "#075985" },   // sky-300
  { fill: "#67e8f9", active: "#06b6d4", text: "#155e75" },   // cyan-300
];

export function BracketVisualization({
  brackets,
  taxableIncome,
  label,
  withheld,
  estimatedTax,
}: BracketVisualizationProps) {
  if (brackets.length === 0) return null;

  const segments = brackets.map((bracket, i) => {
    const floor = i === 0 ? 0 : (brackets[i - 1].upTo ?? 0);
    const ceiling = bracket.upTo;
    const rate = bracket.rate;
    return { floor, ceiling, rate };
  });

  const finiteWidths = segments
    .filter((s) => s.ceiling !== null)
    .map((s) => s.ceiling! - s.floor);
  const maxFiniteWidth =
    finiteWidths.length > 0 ? Math.max(...finiteWidths) : 100_000;

  const displayWidths = segments.map((s) =>
    s.ceiling !== null ? s.ceiling - s.floor : maxFiniteWidth
  );

  const sqrtWidths = displayWidths.map((w) => Math.sqrt(Math.max(w, 1)));
  const totalSqrt = sqrtWidths.reduce((a, b) => a + b, 0);
  const TOTAL_HEIGHT = 340;
  const MIN_HEIGHT = 28;

  let heights = sqrtWidths.map((sw) => (sw / totalSqrt) * TOTAL_HEIGHT);
  heights = heights.map((h) => Math.max(h, MIN_HEIGHT));
  const actualTotal = heights.reduce((a, b) => a + b, 0);
  heights = heights.map((h) => (h / actualTotal) * TOTAL_HEIGHT);

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

  const cumTaxAtFloor: number[] = [];
  const taxCapacity: number[] = [];
  let cumTax = 0;
  for (let i = 0; i < segments.length; i++) {
    cumTaxAtFloor.push(cumTax);
    const width =
      segments[i].ceiling !== null
        ? segments[i].ceiling! - segments[i].floor
        : maxFiniteWidth;
    taxCapacity.push(width * segments[i].rate);
    cumTax += taxCapacity[i];
  }

  function taxFill(taxAmount: number, segIndex: number): number {
    const ceil = cumTaxAtFloor[segIndex] + taxCapacity[segIndex];
    if (taxAmount >= ceil) return 1;
    if (taxAmount > cumTaxAtFloor[segIndex])
      return (taxAmount - cumTaxAtFloor[segIndex]) / taxCapacity[segIndex];
    return 0;
  }

  const withheldFills = segments.map((_, i) => taxFill(withheld, i));
  const estimatedFills = segments.map((_, i) => taxFill(estimatedTax, i));

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

  const renderData = segments
    .map((seg, i) => ({
      ...seg,
      height: heights[i],
      fill: fills[i],
      isActive: fills[i] > 0 && fills[i] < 1,
      isFull: fills[i] >= 1,
      withheldFill: withheldFills[i],
      estimatedFill: estimatedFills[i],
      color: BRACKET_COLORS[i % BRACKET_COLORS.length],
    }))
    .reverse();

  const additional = Math.max(0, estimatedTax - withheld);
  const onTrack = additional <= 0;

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm font-display font-semibold mb-3">{label}</p>
      <div className="w-full rounded-xl overflow-hidden border border-border/60 shadow-sm">
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
                "relative w-full border-b border-border/20 last:border-b-0 transition-all duration-300",
                seg.isActive && "z-10"
              )}
              style={{ height: seg.height }}
            >
              {/* Base background */}
              <div className="absolute inset-0 bg-muted/20" />

              {/* Colored fill from bottom */}
              {seg.fill > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                  style={{
                    height: `${seg.fill * 100}%`,
                    backgroundColor: seg.color.fill,
                    opacity: seg.isFull ? 0.7 : 0.85,
                  }}
                />
              )}

              {/* Active bracket highlight bar */}
              {seg.isActive && (
                <>
                  <div
                    className="absolute left-0 right-0 h-0.5"
                    style={{
                      bottom: `${seg.fill * 100}%`,
                      background: `linear-gradient(to right, ${seg.color.active}, transparent)`,
                    }}
                  />
                  <div
                    className="absolute left-0 w-1 rounded-r-full"
                    style={{
                      bottom: 0,
                      height: `${seg.fill * 100}%`,
                      backgroundColor: seg.color.active,
                    }}
                  />
                </>
              )}

              {/* Withheld (paid) line */}
              {seg.withheldFill > 0 && seg.withheldFill < 1 && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed"
                  style={{
                    bottom: `${seg.withheldFill * 100}%`,
                    borderColor: "#047857",
                  }}
                />
              )}

              {/* Estimated tax line */}
              {seg.estimatedFill > 0 && seg.estimatedFill < 1 && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed"
                  style={{
                    bottom: `${seg.estimatedFill * 100}%`,
                    borderColor: "#be123c",
                  }}
                />
              )}

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <span
                  className="text-xs font-semibold font-mono"
                  style={{
                    color: seg.isActive
                      ? seg.color.text
                      : seg.isFull
                        ? seg.color.text + "99"
                        : "#a8a29e",
                  }}
                >
                  {rateLabel}
                </span>
                <span
                  className="text-[10px] font-mono"
                  style={{
                    color: seg.isActive
                      ? seg.color.text + "cc"
                      : seg.isFull
                        ? seg.color.text + "66"
                        : "#a8a29e88",
                  }}
                >
                  {rangeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption — refined ledger style */}
      <div className="mt-3 w-full space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Taxable</span>
          <span className="font-mono tabular-nums font-medium">
            {formatCurrencyCompact(taxableIncome)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Marginal Rate</span>
          <span className="font-mono tabular-nums font-medium">
            {formatPercent(marginalRate)}
          </span>
        </div>
        <div className="h-px bg-border/50 my-1" />
        <div className="flex justify-between text-xs items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#047857" }} />
            <span className="text-muted-foreground">Withheld</span>
          </span>
          <span className="font-mono tabular-nums font-medium">
            {formatCurrencyCompact(withheld)}
          </span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#be123c" }} />
            <span className="text-muted-foreground">Estimated Tax</span>
          </span>
          <span className="font-mono tabular-nums font-medium">
            {formatCurrencyCompact(estimatedTax)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Additional</span>
          <span
            className={cn(
              "font-mono tabular-nums font-semibold",
              onTrack ? "text-[#047857]" : "text-[#be123c]"
            )}
          >
            {onTrack ? "On track" : formatCurrencyCompact(additional)}
          </span>
        </div>
      </div>
    </div>
  );
}
