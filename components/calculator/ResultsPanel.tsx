"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { TaxResults, PartnerBreakdown, Job, TaxBracket } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { BracketVisualization } from "./BracketVisualization";

interface ResultsPanelProps {
  results: TaxResults;
  yourJobs: Job[];
  spouseJobs: Job[];
  fedBrackets: TaxBracket[];
  stateBrackets: TaxBracket[];
  mode: "top" | "progressive";
}

function PartnerCard({
  label,
  partner,
  effectiveTaxRate,
  jobs,
}: {
  label: string;
  partner: PartnerBreakdown;
  effectiveTaxRate: number;
  jobs: Job[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isUnderWithholding = partner.underWithholding > 0.01;
  const isOverWithholding = partner.underWithholding < -0.01;
  const hasIncome = partner.gross > 0.01;

  const rateGap = effectiveTaxRate - partner.effectiveWithholdingRate;
  const isWithholdingLow = rateGap > 0.001;

  const jobsWithIncome = jobs.filter((job) => job.gross > 0);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        hasIncome && isUnderWithholding && "border-[#be123c]/20 bg-[#be123c]/[0.03]",
        hasIncome && isOverWithholding && "border-[#047857]/20 bg-[#047857]/[0.03]",
        !hasIncome || (!isUnderWithholding && !isOverWithholding) ? "border-border/50 bg-muted/20" : ""
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-display font-semibold">{label}</p>
        {hasIncome && (
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full",
              isUnderWithholding && "bg-[#be123c]/10 text-[#be123c]",
              isOverWithholding && "bg-[#047857]/10 text-[#047857]",
              !isUnderWithholding && !isOverWithholding && "bg-muted text-muted-foreground"
            )}
          >
            {isUnderWithholding ? "Under-withheld" : isOverWithholding ? "Over-withheld" : "On track"}
          </span>
        )}
      </div>

      {hasIncome ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div className="text-muted-foreground">Gross Income</div>
            <div className="text-right font-mono tabular-nums">{formatCurrency(partner.gross)}</div>

            <div className="text-muted-foreground">Fed Withheld</div>
            <div className="text-right font-mono tabular-nums">
              {formatCurrency(partner.fedWithheld)}
              <span className="text-muted-foreground/60 ml-1">
                ({formatPercent(partner.gross > 0 ? partner.fedWithheld / partner.gross : 0)})
              </span>
            </div>

            <div className="text-muted-foreground">State Withheld</div>
            <div className="text-right font-mono tabular-nums">
              {formatCurrency(partner.stateWithheld)}
              <span className="text-muted-foreground/60 ml-1">
                ({formatPercent(partner.gross > 0 ? partner.stateWithheld / partner.gross : 0)})
              </span>
            </div>

            <div className="text-muted-foreground font-medium pt-1 border-t border-border/40">Total Withheld</div>
            <div className={cn(
              "text-right font-mono tabular-nums font-medium pt-1 border-t border-border/40",
              isWithholdingLow ? "text-[#be123c]" : "text-[#047857]"
            )}>
              {formatCurrency(partner.totalWithheld)}
              <span className="ml-1">
                ({formatPercent(partner.effectiveWithholdingRate)})
              </span>
            </div>

            <div className="text-muted-foreground">Fair Share of Tax</div>
            <div className="text-right font-mono tabular-nums">{formatCurrency(partner.fairShareOfTax)}</div>
          </div>

          {isWithholdingLow && (
            <p className="text-[11px] text-[#be123c]/70 mt-2 italic">
              Target rate: {formatPercent(effectiveTaxRate)}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Shortfall / Surplus</span>
              <span
                className={cn(
                  "font-mono tabular-nums text-sm font-semibold",
                  isUnderWithholding && "text-[#be123c]",
                  isOverWithholding && "text-[#047857]"
                )}
              >
                {partner.underWithholding > 0 ? "\u2212" : "+"}
                {formatCurrency(Math.abs(partner.underWithholding))}
              </span>
            </div>
          </div>

          {/* Collapsible Per-Job Breakdown */}
          {jobsWithIncome.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3 pt-2 border-t border-border/40">
              <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
                <span>View by Job ({jobsWithIncome.length})</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {jobsWithIncome.map((job) => {
                  const totalWithheld = job.fed + job.state;
                  const totalRate = job.gross > 0 ? totalWithheld / job.gross : 0;
                  const fedRate = job.gross > 0 ? job.fed / job.gross : 0;
                  const stateRate = job.gross > 0 ? job.state / job.gross : 0;
                  const jobIsLow = effectiveTaxRate - totalRate > 0.001;

                  return (
                    <div
                      key={job.id}
                      className={cn(
                        "p-2.5 rounded-lg text-xs border",
                        jobIsLow
                          ? "bg-[#be123c]/[0.03] border-[#be123c]/15"
                          : "bg-muted/30 border-border/40"
                      )}
                    >
                      <div className="font-medium mb-1.5 text-foreground/80">
                        {job.name || "Unnamed Job"}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-muted-foreground">
                        <div>Gross</div>
                        <div className="text-right font-mono tabular-nums text-foreground">
                          {formatCurrency(job.gross)}
                        </div>
                        <div>Fed W/H</div>
                        <div className="text-right font-mono tabular-nums text-foreground">
                          {formatCurrency(job.fed)}
                          <span className="text-muted-foreground/60 ml-1">({formatPercent(fedRate)})</span>
                        </div>
                        <div>State W/H</div>
                        <div className="text-right font-mono tabular-nums text-foreground">
                          {formatCurrency(job.state)}
                          <span className="text-muted-foreground/60 ml-1">({formatPercent(stateRate)})</span>
                        </div>
                        <div className="font-medium pt-0.5 border-t border-border/30">Total</div>
                        <div className={cn(
                          "text-right font-mono tabular-nums font-medium pt-0.5 border-t border-border/30",
                          jobIsLow ? "text-[#be123c]" : "text-[#047857]"
                        )}>
                          {formatCurrency(totalWithheld)}
                          <span className="ml-1">({formatPercent(totalRate)})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground/50 italic">No income entered</p>
      )}
    </div>
  );
}

export function ResultsPanel({ results, yourJobs, spouseJobs, fedBrackets, stateBrackets, mode }: ResultsPanelProps) {
  const isSufficient = results.totalAdd < 0.01;

  return (
    <Card className="overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-border/60">
        <h2 className="font-display text-lg font-semibold tracking-tight">Results</h2>
      </div>
      <CardContent className="pt-5 space-y-6">
        {/* Summary Row — editorial ledger style */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Gross", value: results.totalGross },
            { label: "Federal Withheld", value: results.totalFedWithheld },
            { label: "State Withheld", value: results.totalStateWithheld },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                {item.label}
              </p>
              <p className="text-lg font-semibold font-mono tabular-nums tracking-tight">
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Tax Estimate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Federal Tax */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">
              Est. Federal Tax
            </p>
            <p className="text-xl font-semibold font-mono tabular-nums tracking-tight">
              {formatCurrency(results.fedTax)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Additional:{" "}
              <span className="font-mono tabular-nums font-medium">{formatCurrency(results.fedAdd)}</span>
            </p>
          </div>

          {/* State Tax */}
          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">
              Est. State Tax
            </p>
            <p className="text-xl font-semibold font-mono tabular-nums tracking-tight">
              {formatCurrency(results.stateTax)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Additional:{" "}
              <span className="font-mono tabular-nums font-medium">{formatCurrency(results.stateAdd)}</span>
            </p>
          </div>

          {/* Total Additional — hero card */}
          <div
            className={cn(
              "rounded-xl border-2 p-4 transition-colors",
              isSufficient
                ? "border-[#047857]/30 bg-gradient-to-br from-[#047857]/[0.04] to-[#047857]/[0.01]"
                : "border-[#be123c]/30 bg-gradient-to-br from-[#be123c]/[0.04] to-[#be123c]/[0.01]"
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">
              Total Additional
            </p>
            <p
              className={cn(
                "text-2xl font-bold font-mono tabular-nums tracking-tight",
                isSufficient ? "text-[#047857]" : "text-[#be123c]"
              )}
            >
              {formatCurrency(results.totalAdd)}
            </p>
            <p
              className={cn(
                "text-[11px] font-medium mt-2",
                isSufficient ? "text-[#047857]/70" : "text-[#be123c]/70"
              )}
            >
              {isSufficient
                ? "Withholding appears sufficient"
                : "Additional withholding needed"}
            </p>
          </div>
        </div>

        {/* Effective Tax Rate — accent bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/40">
          <span className="text-xs text-muted-foreground">Effective Combined Tax Rate</span>
          <div className="flex-1" />
          <span className="font-mono tabular-nums font-semibold text-sm">{formatPercent(results.effectiveTaxRate)}</span>
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">target</span>
        </div>

        {/* Bracket Visualization (progressive mode only) */}
        {mode === "progressive" && (
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-4">
              Marginal Tax Brackets
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BracketVisualization
                brackets={fedBrackets}
                taxableIncome={results.fedTaxable}
                label="Federal"
                withheld={results.totalFedWithheld}
                estimatedTax={results.fedTax}
              />
              <BracketVisualization
                brackets={stateBrackets}
                taxableIncome={results.stateTaxable}
                label="State"
                withheld={results.totalStateWithheld}
                estimatedTax={results.stateTax}
              />
            </div>
          </div>
        )}

        {/* Partner Breakdown */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-4">
            Withholding by Partner
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PartnerCard
              label="You"
              partner={results.you}
              effectiveTaxRate={results.effectiveTaxRate}
              jobs={yourJobs}
            />
            <PartnerCard
              label="Spouse"
              partner={results.spouse}
              effectiveTaxRate={results.effectiveTaxRate}
              jobs={spouseJobs}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
