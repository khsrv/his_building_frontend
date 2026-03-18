import { redirect } from "next/navigation";
import { routes } from "@/shared/constants/routes";

export default function FinancePage() {
  redirect(routes.financeLedger);
}
