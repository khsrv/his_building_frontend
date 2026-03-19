import { ShimmerBox } from "@/shared/ui";

export default function BuildingUnitsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-36" />
        <ShimmerBox className="h-8 w-48" />
      </div>

      <div className="flex gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <ShimmerBox key={i} className="h-10 w-36 rounded-lg" />
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <ShimmerBox className="h-10 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <ShimmerBox key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
