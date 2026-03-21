import { ShimmerBox } from "@/shared/ui";

export default function ChessGridLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-5 w-48" />
        <ShimmerBox className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
        {Array.from({ length: 40 }, (_, i) => (
          <ShimmerBox key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
