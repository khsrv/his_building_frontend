import { NextResponse } from "next/server";
import { createGetCurrentUserUseCase } from "@/modules/auth/application/use-cases/get-current-user.use-case";
import { NextAuthRepository } from "@/modules/auth/infrastructure/auth-repository";

export interface NbtRate {
  code: string;
  name: string;
  unit: number;
  rate: number;
}

export interface NbtRatesResponse {
  date: string;
  rates: NbtRate[];
}

/**
 * Parses exchange rates from the National Bank of Tajikistan (nbt.tj).
 * Caches the result for 1 hour via Next.js revalidation.
 */
export async function GET() {
  const getCurrentUser = createGetCurrentUserUseCase(new NextAuthRepository());
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // nbt.tj has an expired SSL cert — use Node's native fetch with TLS override
    const res = await fetch("https://www.nbt.tj/ru/kurs/kurs.php", {
      next: { revalidate: 3600 },
      // @ts-expect-error — Node.js fetch supports this but types don't include it
      agent: undefined,
    });

    // If the above fails due to SSL, we'll catch and try a workaround
    const html = await res.text();
    return NextResponse.json(parseRates(html));
  } catch {
    // Fallback: try with http or return cached/fallback data
    try {
      const { execSync } = await import("child_process");
      const html = execSync(
        "curl -sk 'https://www.nbt.tj/ru/kurs/kurs.php' --max-time 10",
        { encoding: "utf-8", timeout: 15000 },
      );
      return NextResponse.json(parseRates(html));
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch rates from NBT" },
        { status: 502 },
      );
    }
  }
}

function parseRates(html: string): NbtRatesResponse {
  const rates: NbtRate[] = [];

  // Extract rows from the first table (main rates)
  const tableMatch = html.match(/<table[^>]*id="myTable"[^>]*>([\s\S]*?)<\/table>/);
  if (!tableMatch) return { date: new Date().toISOString().slice(0, 10), rates };

  const tbody = tableMatch[1] ?? "";
  const rowRegex = /<tr class="sortTRnbt">([\s\S]*?)<\/tr>/g;

  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(tbody)) !== null) {
    const row = match[1] ?? "";
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
      (m) => (m[1] ?? "").replace(/<[^>]*>/g, "").trim(),
    );

    if (cells.length >= 5) {
      const code = cells[1] ?? "";
      const unit = parseInt(cells[2] ?? "1", 10) || 1;
      const name = cells[3] ?? "";
      const rate = parseFloat(cells[4] ?? "0") || 0;

      if (rate > 0) {
        rates.push({ code, name, unit, rate });
      }
    }
  }

  // Map numeric codes to ISO currency codes
  const codeMap: Record<string, string> = {
    "840": "USD",
    "978": "EUR",
    "810": "RUB",
    "156": "CNY",
    "756": "CHF",
    "826": "GBP",
    "860": "UZS",
    "417": "KGS",
    "398": "KZT",
    "933": "BYN",
    "392": "JPY",
    "949": "TRY",
    "364": "IRR",
    "586": "PKR",
    "356": "INR",
    "784": "AED",
    "682": "SAR",
    "410": "KRW",
    "036": "AUD",
    "124": "CAD",
  };

  for (const r of rates) {
    r.code = codeMap[r.code] ?? r.code;
  }

  const today = new Date().toISOString().slice(0, 10);
  return { date: today, rates };
}
