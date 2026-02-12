import { TaxCalculator } from "@/components/calculator/TaxCalculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-background bg-grain p-4 md:p-8 lg:p-12">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Editorial Header */}
        <header className="mb-10 animate-fade-up">
          <div className="flex items-end gap-3 mb-3">
            <div
              className="w-1 h-10 rounded-full"
              style={{ background: "linear-gradient(to bottom, #b45309, #d97706)" }}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b45309] mb-1">
                Tax Year 2025
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight leading-none text-foreground">
                Withholding Estimator
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Estimate federal and California state tax withholdings for married
            filing jointly. Two calculation modes available:{" "}
            <span className="inline-flex items-center px-2.5 py-0.5 border border-[#e2ddd4] rounded-full text-xs font-medium text-foreground bg-card shadow-sm">
              Progressive brackets
            </span>{" "}
            for realistic estimates, or{" "}
            <span className="inline-flex items-center px-2.5 py-0.5 border border-[#e2ddd4] rounded-full text-xs font-medium text-foreground bg-card shadow-sm">
              Top-rate
            </span>{" "}
            for worst-case planning.
          </p>
        </header>

        <TaxCalculator />

        {/* Footer */}
        <footer className="mt-16 mb-8 animate-fade-up delay-7">
          <div className="ornament-divider text-xs">
            <span className="font-display italic text-muted-foreground">
              est. {new Date().getFullYear()}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
