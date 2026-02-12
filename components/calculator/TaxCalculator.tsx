"use client";

import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { SettingsPanel } from "./SettingsPanel";
import { JobTable } from "./JobTable";
import { ResultsPanel } from "./ResultsPanel";
import { BracketEditor } from "./BracketEditor";
import { calculateTaxes } from "@/lib/tax-calculator";
import { generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  DEFAULT_FEDERAL_BRACKETS,
  DEFAULT_CA_BRACKETS,
  STORAGE_KEY,
} from "@/lib/constants";
import type { CalculatorState, CalculatorSettings, Job, TaxBracket, FilingStatus } from "@/lib/types";

const initialState: CalculatorState = {
  settings: DEFAULT_SETTINGS,
  you: [{ id: generateId(), name: "", gross: 0, fed: 0, state: 0 }],
  spouse: [{ id: generateId(), name: "", gross: 0, fed: 0, state: 0 }],
  fedBrackets: DEFAULT_FEDERAL_BRACKETS,
  stateBrackets: DEFAULT_CA_BRACKETS,
};

export function TaxCalculator() {
  const [state, setState, isLoaded] = useLocalStorage<CalculatorState>(
    STORAGE_KEY,
    initialState
  );

  const results = useMemo(() => {
    const fedBrackets = state.fedBrackets[state.settings.filingStatus];
    const stateBrackets = state.stateBrackets[state.settings.filingStatus];
    return calculateTaxes(
      state.settings,
      state.you,
      state.spouse,
      fedBrackets,
      stateBrackets
    );
  }, [state]);

  const handleSettingsChange = (settings: CalculatorSettings) => {
    setState((prev) => ({ ...prev, settings }));
  };

  const handleYouChange = (you: Job[]) => {
    setState((prev) => ({ ...prev, you }));
  };

  const handleSpouseChange = (spouse: Job[]) => {
    setState((prev) => ({ ...prev, spouse }));
  };

  const handleFedBracketsChange = (fedBrackets: Record<FilingStatus, TaxBracket[]>) => {
    setState((prev) => ({ ...prev, fedBrackets }));
  };

  const handleStateBracketsChange = (stateBrackets: Record<FilingStatus, TaxBracket[]>) => {
    setState((prev) => ({ ...prev, stateBrackets }));
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        </div>
        <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notes — refined callout */}
      <div className="animate-fade-up delay-1 rounded-xl border border-[#d4a574]/30 bg-gradient-to-r from-[#fef3c7]/40 via-[#fffbeb]/30 to-transparent p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b45309]/10 text-[#b45309]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v6M6 9v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#92400e] mb-1.5">
              Estimates Only
            </p>
            <ul className="text-xs text-[#78350f]/70 space-y-1 leading-relaxed">
              <li>Uses <strong className="text-[#78350f]">gross income</strong> (not W-2 wages after pre-tax benefits)</li>
              <li>Ignores credits (CTC, EV), itemized deductions, AMT, capital gains, NIIT</li>
              <li>State defaults configured for <strong className="text-[#78350f]">California</strong> — edit brackets for other states</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="animate-fade-up delay-2">
        <SettingsPanel
          settings={state.settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>

      {/* Job Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-fade-up delay-3">
          <JobTable
            title="Your Jobs"
            jobs={state.you}
            onJobsChange={handleYouChange}
          />
        </div>
        <div className="animate-fade-up delay-4">
          <JobTable
            title="Spouse Jobs"
            jobs={state.spouse}
            onJobsChange={handleSpouseChange}
          />
        </div>
      </div>

      {/* Results */}
      <div className="animate-fade-up delay-5">
        <ResultsPanel
          results={results}
          yourJobs={state.you}
          spouseJobs={state.spouse}
          fedBrackets={state.fedBrackets[state.settings.filingStatus]}
          stateBrackets={state.stateBrackets[state.settings.filingStatus]}
          mode={state.settings.mode}
        />
      </div>

      {/* Bracket Editor Dialog */}
      <div className="flex justify-center animate-fade-up delay-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-dashed hover:border-solid transition-all"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Edit Tax Brackets
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Tax Bracket Editor</DialogTitle>
              <DialogDescription>
                Edit the federal and state tax brackets used for progressive calculation.
                Format: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{"[{ \"upTo\": 11925, \"rate\": 0.10 }, ...]"}</code>
              </DialogDescription>
            </DialogHeader>
            <BracketEditor
              filingStatus={state.settings.filingStatus}
              fedBrackets={state.fedBrackets}
              stateBrackets={state.stateBrackets}
              onFedBracketsChange={handleFedBracketsChange}
              onStateBracketsChange={handleStateBracketsChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
