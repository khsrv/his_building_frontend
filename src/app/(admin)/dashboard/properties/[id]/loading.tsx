import { ShimmerBox } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <ShimmerBox className="h-16" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBox key={i} className="h-24" />
        ))}
      </div>
      <ShimmerBox className="h-72" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ShimmerBox className="h-72" />
        <ShimmerBox className="h-72" />
      </div>
    </div>
  );
}
