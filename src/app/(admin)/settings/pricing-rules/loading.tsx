import { ShimmerBox } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <ShimmerBox className="h-16" />
      <ShimmerBox className="h-12" />
      <ShimmerBox className="h-64" />
    </div>
  );
}
