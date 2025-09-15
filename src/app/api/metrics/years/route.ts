// app/api/metrics/years/route.ts
import { NextResponse } from "next/server";

const START_YEAR = 2024;
const MIN_YEARS = 5;

export async function GET() {
  const now = new Date().getFullYear();
  // End year is the larger of (2028 = 2024 + 5 - 1) or the current year.
  const end = Math.max(START_YEAR + MIN_YEARS - 1, now);

  const years = Array.from({ length: end - START_YEAR + 1 }, (_, i) => START_YEAR + i);
  return NextResponse.json({ years });
}
