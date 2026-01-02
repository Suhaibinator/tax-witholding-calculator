"use client";

import { useMemo, useState } from "react";
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

  // Show loading skeleton while localStorage is being read
  if (!isLoaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notes/Limits */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-amber-900">Notes / Limits:</p>
        <ul className="list-disc list-inside text-amber-800 mt-2 space-y-1">
          <li>This uses <strong>gross income</strong> you enter (not W-2 wages after pre-tax benefits).</li>
          <li>It ignores credits (CTC, EV, etc.), itemized deductions, AMT, capital gains rates, NIIT, etc.</li>
          <li>State defaults are set up for <strong>California</strong> (you can edit brackets for other states).</li>
        </ul>
      </div>

      {/* Settings */}
      <SettingsPanel
        settings={state.settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Job Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobTable
          title="Your Jobs"
          jobs={state.you}
          onJobsChange={handleYouChange}
        />
        <JobTable
          title="Spouse Jobs"
          jobs={state.spouse}
          onJobsChange={handleSpouseChange}
        />
      </div>

      {/* Results */}
      <ResultsPanel results={results} yourJobs={state.you} spouseJobs={state.spouse} />

      {/* Bracket Editor Dialog */}
      <div className="flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Edit Tax Brackets
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tax Bracket Editor</DialogTitle>
              <DialogDescription>
                Edit the federal and state tax brackets used for progressive calculation.
                Format: <code className="bg-muted px-1 rounded text-xs">{"[{ \"upTo\": 11925, \"rate\": 0.10 }, ...]"}</code>
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
