import { Suspense } from "react";
import { StarterShowcase } from "@/modules/_template/presentation";

export default function PublicHomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading starter showcase...</div>}>
      <StarterShowcase />
    </Suspense>
  );
}
