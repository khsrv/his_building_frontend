import { ShimmerBox } from "@/shared/ui";

export default function BuildingsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-36" />
        <ShimmerBox className="h-8 w-60" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ShimmerBox key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <ShimmerBox className="h-10 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => (
            <ShimmerBox key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
