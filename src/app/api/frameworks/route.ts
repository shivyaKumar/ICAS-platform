// src/app/api/frameworks/route.ts
import { NextResponse } from "next/server";

type Division = { name: string; percent: number };
type Framework = {
  id: string;
  name: string;
  percent: number;        // overall compliance for the framework
  divisions: Division[];  // per-division breakdown
};

const MOCK: Framework[] = [
  {
    id: "iso27001",
    name: "ISO 27001",
    percent: 0,
    divisions: [
      { name: "MH", percent: 0 },
      { name: "Carpenters Motors",      percent: 0 },
    ],
  },
  {
    id: "nistcsf",
    name: "NIST CSF",
    percent: 0,
    divisions: [
      { name: "MH", percent: 0 },
      { name: "Carpenters Motors",      percent: 0 },

    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    percent: 0,
    divisions: [
      { name: "MH", percent: 0 },
      { name: "Carpenters Motors",      percent: 0 },
    ],
  },
];

export async function GET() {
  // later you’ll replace this with a call to your .NET backend
  return NextResponse.json({ frameworks: MOCK });
}
