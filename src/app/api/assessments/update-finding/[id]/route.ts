import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const body = await req.json();
    const endpoint = `${BASE}/api/assessments/update-finding/${params.id}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) return NextResponse.json({ success: false, message: text }, { status: res.status });

    console.log("[ICAS-P] Finding updated successfully.");
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] PUT update-finding error:", err);
    return NextResponse.json({ success: false, message: "Failed to update finding" }, { status: 500 });
  }
}
