"use client";

import { useParams } from "next/navigation";
import { AppPageHeader, AppColorGrid } from "@/shared/ui";
import type { PageHeaderCrumb, AppColorGridRow, AppColorGridCell } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

/* ---------- Mock data ---------- */

function makeMockRows(): readonly AppColorGridRow[] {
  const statuses: AppColorGridCell["status"][] = [
    "free", "free", "sold", "free", "booked", "free", "reserved", "free",
  ];

  const rows: AppColorGridRow[] = [];

  for (let floor = 1; floor <= 5; floor++) {
    const cells: AppColorGridCell[] = [];
    const aptsPerFloor = floor <= 2 ? 8 : 6;

    for (let apt = 1; apt <= aptsPerFloor; apt++) {
      const globalNum = (floor - 1) * 8 + apt;
      const statusIndex = (floor * 3 + apt) % statuses.length;
      const status = statuses[statusIndex] ?? "free";
      const rooms = apt % 3 === 0 ? 3 : apt % 2 === 0 ? 2 : 1;
      const area = rooms === 1 ? 42 : rooms === 2 ? 65 : 85;
      const price = area * 5300;

      cells.push({
        id: `cell-${floor}-${apt}`,
        label: String(globalNum),
        status,
        tooltip: `Кв. ${globalNum}, ${rooms}-комн, ${area} м², ${price.toLocaleString("ru-RU")} SM`,
      });
    }

    rows.push({
      id: `floor-${floor}`,
      label: `Этаж ${floor}`,
      cells,
    });
  }

  return rows;
}

const MOCK_ROWS = makeMockRows();

/* ---------- Component ---------- */

export default function ChessGridPage() {
  const params = useParams<{ id: string }>();
  const buildingId = params.id;

  // TODO: Fetch real building data via TanStack Query hook
  const buildingName = "ЖК Сомон";

  const breadcrumbs: readonly PageHeaderCrumb[] = [
    { id: "dashboard", label: "Панель", href: routes.dashboard },
    { id: "buildings", label: "Объекты", href: routes.buildings },
    { id: "detail", label: buildingName, href: routes.buildingDetail(buildingId) },
    { id: "chess", label: "Шахматка" },
  ];

  const handleCellClick = (cell: AppColorGridCell): void => {
    // TODO: Navigate to unit detail or open drawer
    console.log("Cell clicked:", cell);
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        breadcrumbs={breadcrumbs}
        title={`Шахматка — ${buildingName}`}
      />

      <AppColorGrid
        cellSize="md"
        onCellClick={handleCellClick}
        rows={MOCK_ROWS}
        showLegend
      />
    </div>
  );
}
