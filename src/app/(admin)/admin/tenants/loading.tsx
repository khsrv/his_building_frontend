import { ShimmerBox } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <ShimmerBox className="h-16 w-full" />
      <ShimmerBox className="h-96 w-full" />
    </div>
  );
}
