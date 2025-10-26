import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- GET: Download evidence ---------- */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";
    const endpoint = `${BASE}/api/evidence/download/${params.id}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error(`[ICAS-P] Evidence download failed with ${res.status}`);
      return NextResponse.json(
        { success: false, message: `Failed to download evidence` },
        { status: res.status }
      );
    }

    // Extract content info
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = res.headers.get("content-disposition") || "";

    // Stream the file directly
    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (err) {
    console.error("[ICAS-P] Evidence download error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected error during download" },
      { status: 500 }
    );
  }
}
