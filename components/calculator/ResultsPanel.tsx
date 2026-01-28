"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Compare their withholding rate to the effective tax rate
  const rateGap = effectiveTaxRate - partner.effectiveWithholdingRate;
  const isWithholdingLow = rateGap > 0.001;

  // Filter jobs with income
  const jobsWithIncome = jobs.filter((job) => job.gross > 0);

  return (
    <Card className={cn(
      "bg-muted/30",
      hasIncome && isUnderWithholding && "border-red-300 bg-red-50/50",
      hasIncome && isOverWithholding && "border-green-300 bg-green-50/50"
    )}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{label}</p>
          {hasIncome && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isUnderWithholding && "bg-red-100 text-red-700",
                isOverWithholding && "bg-green-100 text-green-700",
                !isUnderWithholding && !isOverWithholding && "bg-gray-100 text-gray-600"
              )}
            >
              {isUnderWithholding ? "Under-withheld" : isOverWithholding ? "Over-withheld" : "On track"}
            </span>
          )}
        </div>

        {hasIncome ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-muted-foreground">Gross Income:</div>
              <div className="text-right font-mono">{formatCurrency(partner.gross)}</div>

              <div className="text-muted-foreground">Fed Withheld:</div>
              <div className="text-right font-mono">
                {formatCurrency(partner.fedWithheld)}
                <span className="text-muted-foreground ml-1">
                  ({formatPercent(partner.gross > 0 ? partner.fedWithheld / partner.gross : 0)})
                </span>
              </div>

              <div className="text-muted-foreground">State Withheld:</div>
              <div className="text-right font-mono">
                {formatCurrency(partner.stateWithheld)}
                <span className="text-muted-foreground ml-1">
                  ({formatPercent(partner.gross > 0 ? partner.stateWithheld / partner.gross : 0)})
                </span>
              </div>

              <div className="text-muted-foreground font-medium">Total Withheld:</div>
              <div className={cn(
                "text-right font-mono font-medium",
                isWithholdingLow ? "text-red-600" : "text-green-600"
              )}>
                {formatCurrency(partner.totalWithheld)}
                <span className={cn(
                  "ml-1",
                  isWithholdingLow ? "text-red-600" : "text-green-600"
                )}>
                  ({formatPercent(partner.effectiveWithholdingRate)})
                </span>
              </div>

              <div className="text-muted-foreground">Fair Share of Tax:</div>
              <div className="text-right font-mono">{formatCurrency(partner.fairShareOfTax)}</div>
            </div>

            {isWithholdingLow && (
              <p className="text-xs text-red-600 mt-2">
                Target rate: {formatPercent(effectiveTaxRate)}
              </p>
            )}

            <div className="mt-3 pt-2 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Shortfall / Surplus:</span>
                <span
                  className={cn(
                    "font-mono font-medium",
                    isUnderWithholding && "text-red-600",
                    isOverWithholding && "text-green-600"
                  )}
                >
                  {partner.underWithholding > 0 ? "−" : "+"}
                  {formatCurrency(Math.abs(partner.underWithholding))}
                </span>
              </div>
            </div>

            {/* Collapsible Per-Job Breakdown */}
            {jobsWithIncome.length > 0 && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3 pt-2 border-t">
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform",
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
                          "p-2 rounded-md text-xs",
                          jobIsLow ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"
                        )}
                      >
                        <div className="font-medium mb-1">
                          {job.name || "Unnamed Job"}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-muted-foreground">
                          <div>Gross:</div>
                          <div className="text-right font-mono text-foreground">
                            {formatCurrency(job.gross)}
                          </div>
                          <div>Fed W/H:</div>
                          <div className="text-right font-mono text-foreground">
                            {formatCurrency(job.fed)}
                            <span className="text-muted-foreground ml-1">({formatPercent(fedRate)})</span>
                          </div>
                          <div>State W/H:</div>
                          <div className="text-right font-mono text-foreground">
                            {formatCurrency(job.state)}
                            <span className="text-muted-foreground ml-1">({formatPercent(stateRate)})</span>
                          </div>
                          <div className="font-medium">Total:</div>
                          <div className={cn(
                            "text-right font-mono font-medium",
                            jobIsLow ? "text-red-600" : "text-green-600"
                          )}>
                            {formatCurrency(totalWithheld)}
                            <span className={cn("ml-1", jobIsLow ? "text-red-600" : "text-green-600")}>
                              ({formatPercent(totalRate)})
                            </span>
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
          <p className="text-xs text-muted-foreground italic">No income entered</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ResultsPanel({ results, yourJobs, spouseJobs, fedBrackets, stateBrackets, mode }: ResultsPanelProps) {
  const isSufficient = results.totalAdd < 0.01;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Gross (You + Spouse)</p>
            <p className="text-lg font-bold font-mono">{formatCurrency(results.totalGross)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Federal Withheld (Total)</p>
            <p className="text-lg font-bold font-mono">{formatCurrency(results.totalFedWithheld)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">State Withheld (Total)</p>
            <p className="text-lg font-bold font-mono">{formatCurrency(results.totalStateWithheld)}</p>
          </div>
        </div>

        {/* Tax Estimates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Estimated Federal Tax</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(results.fedTax)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Additional needed:{" "}
                <span className="font-mono">{formatCurrency(results.fedAdd)}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Estimated State Tax</p>
              <p className="text-lg font-bold font-mono">{formatCurrency(results.stateTax)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Additional needed:{" "}
                <span className="font-mono">{formatCurrency(results.stateAdd)}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Additional (Fed + State)</p>
              <p
                className={cn(
                  "text-lg font-bold font-mono",
                  isSufficient ? "text-green-600" : "text-red-600"
                )}
              >
                {formatCurrency(results.totalAdd)}
              </p>
              <p
                className={cn(
                  "text-xs mt-1",
                  isSufficient ? "text-green-600" : "text-red-600"
                )}
              >
                {isSufficient
                  ? "Withholding appears sufficient"
                  : "Additional withholding needed"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Effective Tax Rate */}
        <div className="flex items-center gap-2 text-sm pt-2">
          <span className="text-muted-foreground">Effective Combined Tax Rate:</span>
          <span className="font-mono font-medium">{formatPercent(results.effectiveTaxRate)}</span>
          <span className="text-xs text-muted-foreground">(target withholding rate)</span>
        </div>

        {/* Bracket Visualization (progressive mode only) */}
        {mode === "progressive" && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-3">Marginal Tax Brackets</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BracketVisualization
                brackets={fedBrackets}
                taxableIncome={results.fedTaxable}
                label="Federal"
              />
              <BracketVisualization
                brackets={stateBrackets}
                taxableIncome={results.stateTaxable}
                label="State"
              />
            </div>
          </div>
        )}

        {/* Partner Breakdown */}
        <div className="pt-2">
          <p className="text-sm font-medium mb-3">Withholding Breakdown by Partner</p>
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
