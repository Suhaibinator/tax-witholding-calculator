import { TaxCalculator } from "@/components/calculator/TaxCalculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-bold">
          2025 Tax Withholding Estimator (You + Spouse)
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Two modes:{" "}
          <span className="inline-block px-2 py-0.5 border rounded-full text-xs">
            Top-rate on all income
          </span>{" "}
          (worst case) and{" "}
          <span className="inline-block px-2 py-0.5 border rounded-full text-xs">
            Progressive brackets
          </span>{" "}
          (more realistic, simplified).
        </p>
        <TaxCalculator />
      </div>
    </main>
  );
}
