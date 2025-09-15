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
    percent: 42,
    divisions: [
      { name: "Finance", percent: 48 },
      { name: "HR",      percent: 37 },
      { name: "IT",      percent: 45 },
      { name: "Ops",     percent: 38 },
    ],
  },
  {
    id: "nistcsf",
    name: "NIST CSF",
    percent: 39,
    divisions: [
      { name: "Finance", percent: 36 },
      { name: "HR",      percent: 32 },
      { name: "IT",      percent: 44 },
      { name: "Ops",     percent: 41 },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR",
    percent: 33,
    divisions: [
      { name: "Finance", percent: 31 },
      { name: "HR",      percent: 35 },
      { name: "IT",      percent: 30 },
      { name: "Ops",     percent: 36 },
    ],
  },
];

export async function GET() {
  // later you’ll replace this with a call to your .NET backend
  return NextResponse.json({ frameworks: MOCK });
}
