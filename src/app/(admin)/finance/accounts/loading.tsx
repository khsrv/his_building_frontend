import { ShimmerBox } from "@/shared/ui";

export default function AccountsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <ShimmerBox className="h-5 w-48" />
        <ShimmerBox className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ShimmerBox key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
