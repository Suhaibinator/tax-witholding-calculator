"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { Job } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface JobTableProps {
  title: string;
  jobs: Job[];
  onJobsChange: (jobs: Job[]) => void;
}

export function JobTable({ title, jobs, onJobsChange }: JobTableProps) {
  const handleJobChange = (index: number, field: keyof Job, value: string | number) => {
    const newJobs = [...jobs];
    if (field === "name") {
      newJobs[index] = { ...newJobs[index], [field]: value as string };
    } else if (field !== "id") {
      newJobs[index] = { ...newJobs[index], [field]: parseFloat(value as string) || 0 };
    }
    onJobsChange(newJobs);
  };

  const addJob = () => {
    onJobsChange([...jobs, { id: generateId(), name: "", gross: 0, fed: 0, state: 0 }]);
  };

  const removeJob = (index: number) => {
    const newJobs = jobs.filter((_, i) => i !== index);
    onJobsChange(newJobs);
  };

  return (
    <Card className="card-hover overflow-hidden h-full">
      <div className="px-6 pt-5 pb-3 border-b border-border/60">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="group relative rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40 hover:border-border"
            >
              {/* Employer row */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block">
                    Employer
                  </label>
                  <Input
                    type="text"
                    value={job.name}
                    placeholder="Company name"
                    onChange={(e) => handleJobChange(index, "name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeJob(index)}
                    className="h-8 w-8 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Numbers row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block">
                    Gross
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={job.gross || ""}
                    placeholder="0"
                    onChange={(e) => handleJobChange(index, "gross", e.target.value)}
                    className="h-8 text-right tabular-nums text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block">
                    Fed W/H
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={job.fed || ""}
                    placeholder="0"
                    onChange={(e) => handleJobChange(index, "fed", e.target.value)}
                    className="h-8 text-right tabular-nums text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1 block">
                    State W/H
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={job.state || ""}
                    placeholder="0"
                    onChange={(e) => handleJobChange(index, "state", e.target.value)}
                    className="h-8 text-right tabular-nums text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addJob}
          className="mt-4 gap-1.5 rounded-full border-dashed text-muted-foreground hover:text-foreground hover:border-solid transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Job
        </Button>
      </CardContent>
    </Card>
  );
}
