// app/api/metrics/framework/route.ts
import { NextRequest, NextResponse } from "next/server";

type SeriesPoint = { month: number; ISO27001: number; NISTCSF: number; GDPR: number };
type Payload = { year: number; series: SeriesPoint[] };

const FIRST_DATA_YEAR = 2025 as const;

// Static demo values (replace with DB later)
const YEARLY: Record<number, { ISO27001: number; NISTCSF: number; GDPR: number }> = {
  2025: { ISO27001: 61, NISTCSF: 55, GDPR: 41 },
  2026: { ISO27001: 70, NISTCSF: 60, GDPR: 50 },
  2027: { ISO27001: 80, NISTCSF: 68, GDPR: 60 },
  2028: { ISO27001: 90, NISTCSF: 75, GDPR: 70 },
};

function seriesFrom(base: { ISO27001: number; NISTCSF: number; GDPR: number }): SeriesPoint[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    ISO27001: base.ISO27001,
    NISTCSF: base.NISTCSF,
    GDPR: base.GDPR,
  }));
}

function monthlyFromYear(y: number): Payload {
  // Before first data year -> explicit 0% baseline (no gaps)
  if (y < FIRST_DATA_YEAR) {
    return { year: y, series: seriesFrom({ ISO27001: 0, NISTCSF: 0, GDPR: 0 }) };
  }

  // Known static years
  const base = YEARLY[y];
  if (base) return { year: y, series: seriesFrom(base) };

  // Future/unknown years -> no data yet (leave gap)
  return { year: y, series: [] };
}

export async function GET(req: NextRequest) {
  const yParam = Number(req.nextUrl.searchParams.get("year"));
  const year = Number.isFinite(yParam) ? yParam : new Date().getFullYear();
  return NextResponse.json(monthlyFromYear(year));
}
