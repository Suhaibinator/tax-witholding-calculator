"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FilingStatus, TaxBracket } from "@/lib/types";
import { tryParseBrackets } from "@/lib/tax-calculator";
import { DEFAULT_FEDERAL_BRACKETS, DEFAULT_CA_BRACKETS } from "@/lib/constants";

interface BracketEditorProps {
  filingStatus: FilingStatus;
  fedBrackets: Record<FilingStatus, TaxBracket[]>;
  stateBrackets: Record<FilingStatus, TaxBracket[]>;
  onFedBracketsChange: (brackets: Record<FilingStatus, TaxBracket[]>) => void;
  onStateBracketsChange: (brackets: Record<FilingStatus, TaxBracket[]>) => void;
}

export function BracketEditor({
  filingStatus,
  fedBrackets,
  stateBrackets,
  onFedBracketsChange,
  onStateBracketsChange,
}: BracketEditorProps) {
  const [fedError, setFedError] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);

  const fedText = JSON.stringify(fedBrackets[filingStatus], null, 2);
  const stateText = JSON.stringify(stateBrackets[filingStatus], null, 2);

  const handleFedChange = (text: string) => {
    const parsed = tryParseBrackets(text);
    if (parsed) {
      setFedError(null);
      onFedBracketsChange({ ...fedBrackets, [filingStatus]: parsed });
    } else {
      setFedError("Invalid JSON format");
    }
  };

  const handleStateChange = (text: string) => {
    const parsed = tryParseBrackets(text);
    if (parsed) {
      setStateError(null);
      onStateBracketsChange({ ...stateBrackets, [filingStatus]: parsed });
    } else {
      setStateError("Invalid JSON format");
    }
  };

  const resetToDefaults = () => {
    onFedBracketsChange({ ...DEFAULT_FEDERAL_BRACKETS });
    onStateBracketsChange({ ...DEFAULT_CA_BRACKETS });
    setFedError(null);
    setStateError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Federal Brackets (2025)</Label>
          <Textarea
            className="font-mono text-xs min-h-[250px]"
            value={fedText}
            onChange={(e) => handleFedChange(e.target.value)}
          />
          {fedError && (
            <p className="text-xs text-destructive">{fedError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>California Brackets (2025)</Label>
          <Textarea
            className="font-mono text-xs min-h-[250px]"
            value={stateText}
            onChange={(e) => handleStateChange(e.target.value)}
          />
          {stateError && (
            <p className="text-xs text-destructive">{stateError}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
