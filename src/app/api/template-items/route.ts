import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      data: [
        { id: "1", title: "Replace _template module", created_at: "2026-03-11T00:00:00.000Z" },
        { id: "2", title: "Wire real backend endpoint", created_at: "2026-03-11T00:05:00.000Z" },
      ],
    },
    { status: 200 },
  );
}
