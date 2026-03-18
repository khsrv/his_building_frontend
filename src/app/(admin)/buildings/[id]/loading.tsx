import { ShimmerBox } from "@/shared/ui";

export default function BuildingDetailLoading() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-36" />
        <ShimmerBox className="h-8 w-60" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-1">
              <ShimmerBox className="h-3 w-20" />
              <ShimmerBox className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ShimmerBox key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      <ShimmerBox className="h-10 w-72" />
      <ShimmerBox className="h-64 w-full rounded-xl" />
    </div>
  );
}
