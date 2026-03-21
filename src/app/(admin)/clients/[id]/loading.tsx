import { ShimmerBox } from "@/shared/ui";

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-5 w-48" />
        <ShimmerBox className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ShimmerBox key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <ShimmerBox className="h-10 w-full rounded-xl" />
      <ShimmerBox className="h-64 w-full rounded-xl" />
    </div>
  );
}
