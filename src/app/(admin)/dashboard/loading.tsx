import { ShimmerBox } from "@/shared/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-4 w-32" />
        <ShimmerBox className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ShimmerBox key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ShimmerBox className="h-64 rounded-xl" />
        <ShimmerBox className="h-64 rounded-xl" />
      </div>

      <ShimmerBox className="h-48 rounded-xl" />
    </div>
  );
}
