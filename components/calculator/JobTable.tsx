"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.map((job, index) => (
            <div key={job.id} className="flex items-center gap-2 pb-3 border-b last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-muted-foreground mb-1 block">Employer</label>
                <Input
                  type="text"
                  value={job.name}
                  placeholder="Company name"
                  onChange={(e) => handleJobChange(index, "name", e.target.value)}
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground mb-1 block">Gross</label>
                <Input
                  type="number"
                  step="0.01"
                  value={job.gross || ""}
                  placeholder="0"
                  onChange={(e) => handleJobChange(index, "gross", e.target.value)}
                  className="text-right tabular-nums"
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground mb-1 block">Fed W/H</label>
                <Input
                  type="number"
                  step="0.01"
                  value={job.fed || ""}
                  placeholder="0"
                  onChange={(e) => handleJobChange(index, "fed", e.target.value)}
                  className="text-right tabular-nums"
                />
              </div>
              <div className="w-28">
                <label className="text-xs text-muted-foreground mb-1 block">State W/H</label>
                <Input
                  type="number"
                  step="0.01"
                  value={job.state || ""}
                  placeholder="0"
                  onChange={(e) => handleJobChange(index, "state", e.target.value)}
                  className="text-right tabular-nums"
                />
              </div>
              <div className="pt-5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeJob(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addJob}
          className="mt-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Job
        </Button>
      </CardContent>
    </Card>
  );
}
