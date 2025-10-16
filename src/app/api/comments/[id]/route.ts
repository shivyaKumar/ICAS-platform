import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- DELETE comment ---------- */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const endpoint = `${BASE}/api/comments/${params.id}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const text = await res.text();
    if (!res.ok)
      return NextResponse.json({ success: false, message: text }, { status: res.status });

    console.log(`[ICAS-P] Comment deleted successfully (ID: ${params.id})`);
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] DELETE comment error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

/* ---------- PUT (Edit) comment ---------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const body = await req.text();
    const endpoint = `${BASE}/api/comments/${params.id}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body,
    });

    const text = await res.text();
    if (!res.ok)
      return NextResponse.json({ success: false, message: text }, { status: res.status });

    console.log(`[ICAS-P] Comment updated successfully (ID: ${params.id})`);
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("[ICAS-P] PUT comment error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update comment" },
      { status: 500 }
    );
  }
}
