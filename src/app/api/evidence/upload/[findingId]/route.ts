import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- POST: Upload evidence ---------- */
export async function POST(req: Request, { params }: { params: { findingId: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";

    const formData = await req.formData();
    const endpoint = `${BASE}/api/evidence/upload/${params.findingId}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const text = await res.text();
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] Evidence upload error:", err);
    return NextResponse.json({ success: false, message: "Failed to upload evidence" }, { status: 500 });
  }
}
