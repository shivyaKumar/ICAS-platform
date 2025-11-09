import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- GET: Fetch comments for a finding ---------- */
export async function GET(
  _: Request,
  context: { params: Promise<{ findingId: string }> }
) {
  try {
    const { findingId } = await context.params; 
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const endpoint = `${BASE}/api/comments/finding/${findingId}`;

    const res = await fetch(endpoint, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`Backend GET failed ${res.status}:`, text);
      return NextResponse.json(
        { success: false, message: text },
        { status: res.status }
      );
    }

    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[Proxy] GET comments error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/* ---------- POST: Add comment to finding ---------- */
export async function POST(
  req: Request,
  context: { params: Promise<{ findingId: string }> }
) {
  try {
    const { findingId } = await context.params; 
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const body = await req.json();
    const endpoint = `${BASE}/api/comments/finding/${findingId}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`Backend POST failed ${res.status}:`, text);
      return NextResponse.json(
        { success: false, message: text },
        { status: res.status }
      );
    }

    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[Proxy] POST comment error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to add comment" },
      { status: 500 }
    );
  }
}
