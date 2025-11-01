import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const token = (await cookies()).get("icas_auth")?.value;
    const endpoint = `${BASE}/api/assessments/${id}/export/xlsx`;

    const upstream = await fetch(endpoint, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      const message = await upstream.text();
      return NextResponse.json(
        {
          success: false,
          message: message || "Failed to export assessment",
        },
        { status: upstream.status },
      );
    }

    const headers = new Headers(upstream.headers);
    headers.set("Cache-Control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (error) {
    console.error("Export assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export assessment" },
      { status: 500 },
    );
  }
}
