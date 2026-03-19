import { ShimmerBox } from "@/shared/ui";

export default function ExchangeRatesLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-48" />
        <ShimmerBox className="h-8 w-56" />
      </div>

      {/* Big cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ShimmerBox key={i} className="h-36 rounded-2xl" />
        ))}
      </div>

      {/* Section title */}
      <ShimmerBox className="h-4 w-32" />

      {/* Compact cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ShimmerBox key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
