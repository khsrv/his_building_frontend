import { redirect } from "next/navigation";

export default async function UnitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/buildings/${id}`);
}
