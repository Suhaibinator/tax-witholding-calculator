"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalculatorSettings, FilingStatus } from "@/lib/types";
import {
  FILING_STATUS_LABELS,
  FEDERAL_STANDARD_DEDUCTIONS,
  CA_STANDARD_DEDUCTIONS,
} from "@/lib/constants";

interface SettingsPanelProps {
  settings: CalculatorSettings;
  onSettingsChange: (settings: CalculatorSettings) => void;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const handleChange = (partial: Partial<CalculatorSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const handleFilingStatusChange = (filingStatus: FilingStatus) => {
    onSettingsChange({
      ...settings,
      filingStatus,
      fedStdDed: FEDERAL_STANDARD_DEDUCTIONS[filingStatus],
      stateStdDed: CA_STANDARD_DEDUCTIONS[filingStatus],
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Calculation Mode</Label>
            <Select
              value={settings.mode}
              onValueChange={(value: "top" | "progressive") =>
                handleChange({ mode: value })
              }
            >
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progressive">
                  Progressive brackets (simplified)
                </SelectItem>
                <SelectItem value="top">
                  All income at top rates (worst-case)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingStatus">Filing Status</Label>
            <Select
              value={settings.filingStatus}
              onValueChange={handleFilingStatusChange}
            >
              <SelectTrigger id="filingStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILING_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="federalTopRate">Federal Top Rate</Label>
            <Input
              id="federalTopRate"
              type="number"
              step="0.001"
              value={settings.federalTopRate}
              onChange={(e) =>
                handleChange({ federalTopRate: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateTopRate">State Top Rate</Label>
            <Input
              id="stateTopRate"
              type="number"
              step="0.001"
              value={settings.stateTopRate}
              onChange={(e) =>
                handleChange({ stateTopRate: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fedStdDed">Federal Std. Deduction</Label>
            <Input
              id="fedStdDed"
              type="number"
              step="1"
              value={settings.fedStdDed}
              onChange={(e) =>
                handleChange({ fedStdDed: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateStdDed">State Std. Deduction</Label>
            <Input
              id="stateStdDed"
              type="number"
              step="1"
              value={settings.stateStdDed}
              onChange={(e) =>
                handleChange({ stateStdDed: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="otherAdj">Other Adjustments</Label>
            <Input
              id="otherAdj"
              type="number"
              step="1"
              value={settings.otherAdj}
              onChange={(e) =>
                handleChange({ otherAdj: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              e.g., pre-tax 401(k) contributions
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="caMhs"
              checked={settings.caMhs}
              onCheckedChange={(checked) =>
                handleChange({ caMhs: checked === true })
              }
            />
            <Label htmlFor="caMhs" className="text-sm font-normal">
              CA 1% MHS surtax (&gt; $1,000,000 taxable)
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
