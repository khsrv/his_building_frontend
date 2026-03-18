import { ShimmerBox } from "@/shared/ui";

export default function FinanceLoading() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-40" />
        <ShimmerBox className="h-8 w-64" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ShimmerBox key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <ShimmerBox className="h-10 w-80" />
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <ShimmerBox key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
