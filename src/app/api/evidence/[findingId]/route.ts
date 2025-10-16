import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- GET: List all evidence for a finding ---------- */
export async function GET(req: Request, { params }: { params: { findingId: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";

    const res = await fetch(`${BASE}/api/evidence/${params.findingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const text = await res.text();
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-FE] Evidence fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch evidence" },
      { status: 500 }
    );
  }
}
