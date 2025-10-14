import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

type RouteContext = { params: Promise<{ findingId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { findingId } = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get("icas_auth")?.value;

    const response = await fetch(`${API_BASE}/api/evidence/${findingId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json({ message: text || "Failed to load evidence" }, { status: response.status });
    }

    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Evidence] list proxy failed", error);
    return NextResponse.json({ message: "Unable to load evidence" }, { status: 500 });
  }
}