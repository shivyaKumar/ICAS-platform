import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/**
 * Proxy: GET /api/assessments/completed
 * Forwards the signed-in user’s cookie to the backend so role filtering happens server-side.
 */
export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";

    const res = await fetch(`${BASE}/api/assessments/completed`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[ICAS-P] Completed assessments fetch failed:", res.status, text);
      return NextResponse.json({ message: text }, { status: res.status });
    }

    const text = await res.text();
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] Completed assessments proxy error:", err);
    return NextResponse.json(
      { message: "Failed to load completed assessments" },
      { status: 500 },
    );
  }
}
