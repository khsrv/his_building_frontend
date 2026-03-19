import { ShimmerBox } from "@/shared/ui";

export default function CalculatorLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-40" />
        <ShimmerBox className="h-8 w-56" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form skeleton */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2">
              <ShimmerBox className="h-4 w-32" />
              <ShimmerBox className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <ShimmerBox className="h-10 w-full rounded-lg" />
        </div>

        {/* Result skeleton */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
          <ShimmerBox className="h-6 w-40" />
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBox key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
