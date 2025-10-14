import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const endpoint = `${BASE}/api/assessments/${params.id}/close`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const text = await res.text();
    if (!res.ok) return NextResponse.json({ success: false, message: text }, { status: res.status });

    console.log("[ICAS-P] Assessment closed successfully.");
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] POST close-assessment error:", err);
    return NextResponse.json({ success: false, message: "Failed to close assessment" }, { status: 500 });
  }
}
